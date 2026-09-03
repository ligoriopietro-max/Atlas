/* Atlas — Interpretation Engine v0.2.1
 * Input: normalized questionnaire object.
 * Output: deterministic Atlas Profile.
 */
(function () {
  "use strict";

  const DATA = window.ATLAS_DATA;

  const DOMAIN_KEYS = Object.keys(DATA.DOMAINS);
  const INTENT_KEYS = Object.keys(DATA.INTENTS);
  const BARRIER_KEYS = Object.keys(DATA.BARRIERS);

  function normalize(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .trim();
  }

  function asArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value == null || value === "") return [];
    return [value];
  }

  function contains(value, phrase) {
    return normalize(value).includes(normalize(phrase));
  }

  function aliasMatch(value, aliases) {
    const text = normalize(value);
    return aliases.some(a => text === normalize(a) || text.includes(normalize(a)));
  }

  function emptyScores(keys) {
    return Object.fromEntries(keys.map(k => [k, 0]));
  }

  function add(scores, key, points) {
    if (scores[key] != null) scores[key] += points;
  }

  function classifyNetwork(input) {
    const resources = asArray(input.resources);
    const resourcesText = normalize(resources.join(" ") + " " + (input.resourcesOther || ""));
    const gaps = asArray(input.gaps).map(normalize).join(" ");
    const barriers = asArray(input.barriers).map(normalize).join(" ");

    const none =
      resources.some(r => normalize(r) === "none") ||
      aliasMatch(resourcesText, DATA.RESOURCE_ALIASES.none);

    const coordinationGap =
      aliasMatch(gaps, DATA.GAP_ALIASES.D09) ||
      aliasMatch(barriers, DATA.BARRIER_ALIASES.B10) ||
      contains(resourcesText, "non collaborano") ||
      contains(resourcesText, "non comunicano");

    const ineffective =
      aliasMatch(barriers, DATA.BARRIER_ALIASES.B13) ||
      aliasMatch(barriers, DATA.BARRIER_ALIASES.B14) ||
      contains(normalize(input.need), "percorso non funziona");

    const newDifficulty =
      DATA.PHASE_ALIASES.nuove_difficolta.some(a => normalize(input.phase) === normalize(a)) ||
      aliasMatch(normalize(input.need), DATA.NEED_ALIASES.D14);

    if (none || resources.length === 0) return "N0";
    if (ineffective) return "N4";
    if (coordinationGap && resources.length >= 2) return "N3";
    if (newDifficulty && resources.length >= 1 && !coordinationGap && !ineffective) return "N5";
    if (resources.length === 1) return "N1";
    return "N2";
  }

  function scorePhase(input, scores) {
    const p = normalize(input.phase);
    if (DATA.PHASE_ALIASES.dubbi.some(a => p === normalize(a))) {
      add(scores, "D01", 1);
      add(scores, "D06", 1);
    } else if (DATA.PHASE_ALIASES.diagnosi.some(a => p === normalize(a))) {
      add(scores, "D01", 1);
      add(scores, "D06", 1);
    } else if (DATA.PHASE_ALIASES.post_diagnosi.some(a => p === normalize(a))) {
      add(scores, "D01", 1);
    } else if (DATA.PHASE_ALIASES.percorso_avviato.some(a => p === normalize(a))) {
      add(scores, "D09", 1);
      add(scores, "D10", 1);
    } else if (DATA.PHASE_ALIASES.nuove_difficolta.some(a => p === normalize(a))) {
      add(scores, "D14", 1);
    }
  }

  function scoreNeed(input, scores) {
    const text = normalize(input.need);
    for (const d of DOMAIN_KEYS) {
      if (aliasMatch(text, DATA.NEED_ALIASES[d])) add(scores, d, 2);
    }

    // Specific disambiguation: "professionals/therapies" is not automatically matching.
    if (contains(text, "professionisti") && contains(text, "terapie")) {
      add(scores, "D02", 1);
      add(scores, "D07", 1);
    }

    if (contains(text, "organizzare terapie")) {
      add(scores, "D10", 2);
      add(scores, "D07", 1);
    }

    if (contains(text, "seconda opinione") || contains(text, "secondo parere")) {
      add(scores, "D04", 4);
      add(scores, "D03", 1);
    }
  }

  function scoreGaps(input, scores) {
    for (const gap of asArray(input.gaps)) {
      for (const d of DOMAIN_KEYS) {
        if (DATA.GAP_ALIASES[d] && aliasMatch(gap, DATA.GAP_ALIASES[d])) add(scores, d, 3);
      }
    }
  }

  function scoreBarriers(input, scores) {
    for (const barrier of asArray(input.barriers)) {
      for (const b of BARRIER_KEYS) {
        if (aliasMatch(barrier, DATA.BARRIER_ALIASES[b])) {
          switch (b) {
            case "B01": add(scores, "D01", 2); break;
            case "B02": add(scores, "D03", 2); break;
            case "B03": add(scores, "D06", 2); break;
            case "B04":
            case "B05": add(scores, "D05", 3); break;
            case "B06": add(scores, "D13", 3); break;
            case "B07": break; // constraint only
            case "B08": add(scores, "D10", 3); break;
            case "B09": add(scores, "D10", 2); break;
            case "B10": add(scores, "D09", 3); break;
            case "B11": add(scores, "D12", 2); break;
            case "B12": add(scores, "D15", 3); break;
            case "B13":
            case "B14": add(scores, "D14", 3); break;
          }
        }
      }
    }
  }

  function scoreIntent(input, intentScores) {
    const text = normalize(input.intent || input.goal || "");

    const mappings = {
      I01: DATA.INTENT_ALIASES.I01,
      I02: DATA.INTENT_ALIASES.I02,
      I03: DATA.INTENT_ALIASES.I03,
      I04: DATA.INTENT_ALIASES.I04,
      I05: DATA.INTENT_ALIASES.I05,
      I06: DATA.INTENT_ALIASES.I06,
      I07: DATA.INTENT_ALIASES.I07,
      I08: DATA.INTENT_ALIASES.I08,
      I09: DATA.INTENT_ALIASES.I09,
      I10: DATA.INTENT_ALIASES.I10
    };

    for (const i of INTENT_KEYS) {
      if (aliasMatch(text, mappings[i])) add(intentScores, i, 3);
    }

    // Cost-compatible is a D13 intent, not a generic "search" intent.
    if (aliasMatch(text, DATA.INTENT_ALIASES.I02_COST)) add(intentScores, "I10", 1);
  }

  function applyInteractions(input, domainScores, intentScores, network) {
    const need = normalize(input.need);
    const gaps = asArray(input.gaps).map(normalize).join(" ");
    const barriers = asArray(input.barriers).map(normalize).join(" ");
    const goal = normalize(input.intent || input.goal || "");
    const phase = normalize(input.phase);

    // Core interactions agreed in Step 4.
    if (network === "N0" && contains(barriers, "non so chi contattare")) {
      add(domainScores, "D01", 3);
    }

    if (
      contains(need, "professionisti") &&
      contains(gaps, "professionisti") &&
      contains(goal, "trovare")
    ) {
      add(domainScores, "D02", 4);
    }

    if (
      network === "N3" &&
      contains(gaps, "coordinamento") &&
      (contains(barriers, "coordinamento") || contains(barriers, "non collaborano"))
    ) {
      add(domainScores, "D09", 5);
      add(domainScores, "D02", -3);
      add(domainScores, "D10", -2);
    }

    if (
      network === "N2" &&
      (contains(barriers, "disponibilita") || contains(barriers, "attesa")) &&
      (contains(goal, "ridurre") || contains(goal, "attesa"))
    ) {
      add(domainScores, "D05", 6);
    }

    if (
      contains(gaps, "professionisti") &&
      contains(barriers, "scegliere") &&
      contains(goal, "confrontare")
    ) {
      add(domainScores, "D03", 6);
    }

    if (
      (contains(phase, "percorso_avviato") || contains(phase, "percorso avviato")) &&
      (contains(barriers, "non adatta") || contains(barriers, "inefficace"))
    ) {
      add(domainScores, "D14", 4);
      if (contains(goal, "trovare")) add(domainScores, "D02", 2);
    }

    if (contains(need, "informazioni") && (contains(goal, "capire") || contains(goal, "comprendere"))) {
      add(domainScores, "D06", 5);
    }

    if (contains(need, "prossimo passo") && contains(goal, "iniziare")) {
      add(domainScores, "D01", 6);
    }

    if (
      DATA.PHASE_ALIASES.nuove_difficolta.some(a => phase === normalize(a)) &&
      contains(gaps, "quotidiana") &&
      (contains(goal, "gestire") || contains(goal, "supporto"))
    ) {
      add(domainScores, "D14", 3);
      add(domainScores, "D08", 3);
    }

    // Second opinion is a distinct domain when explicit.
    if (
      contains(need, "seconda opinione") ||
      contains(need, "secondo parere") ||
      contains(gaps, "seconda opinione")
    ) {
      add(domainScores, "D04", 4);
      if (contains(goal, "confrontare")) add(domainScores, "D04", 2);
    }

    // Multiple resources + coordination gap: don't force matching.
    if (network === "N3") add(domainScores, "D02", -3);

    // B10 is coordination, unless the questionnaire explicitly points to organization too.
    if (contains(barriers, "coordinamento") && !contains(gaps, "coordinamento")) {
      add(domainScores, "D10", -2);
    }

    // School/services/institutions intent can support both domains.
    if (
      contains(goal, "scuola") ||
      contains(goal, "servizi") ||
      contains(goal, "istituzioni")
    ) {
      add(domainScores, "D11", 3);
      add(domainScores, "D12", 3);
    }
  }

  function rank(scores) {
    return Object.entries(scores)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }

  function classifyIntent(intentScores) {
    const ranked = rank(intentScores);
    if (!ranked.length) return { primary: null, secondary: [] };
    const primary = ranked[0];
    const secondary = ranked.slice(1).filter(([, v]) => v >= 3 && primary[1] - v <= 3);
    return {
      primary: primary[0],
      secondary: secondary.map(([k]) => k)
    };
  }

  function classifyConfidence(ranked, network) {
    if (!ranked.length) return "LOW";

    const first = ranked[0][1];
    const second = ranked[1] ? ranked[1][1] : 0;
    const convergence = ranked.filter(([, v]) => v >= Math.max(3, first - 3)).length;

    if (first >= 6 && first - second >= 3 && convergence >= 2) return "HIGH";
    if (first >= 4 && convergence >= 2) return "MEDIUM";
    if (network === "N3" || network === "N4") return "MEDIUM";
    return "LOW";
  }

  function classifyPriority(input, domainScores, network) {
    // Safety architecture intentionally incomplete in v0.2:
    // no P1 without a dedicated safety gate.
    const barriers = asArray(input.barriers).map(normalize).join(" ");
    const ranked = rank(domainScores);
    const top = ranked[0] ? ranked[0][0] : null;

    if (
      network === "N4" ||
      contains(barriers, "attesa troppo lunga") ||
      contains(barriers, "nessuna disponibilita") ||
      top === "D09" ||
      top === "D14"
    ) return "P2";

    if (top === "D06" || top === "D01") return "P4";
    if (top) return "P3";
    return "P4";
  }

  function buildConstraints(input) {
    return {
      comune: input.comune || "",
      provincia: input.provincia || "",
      distanza: input.distance || input.distanza || "",
      online: input.online || "",
      feasibility_only: true
    };
  }

  function buildProfile(input) {
    input = input || {};

    const domainScores = emptyScores(DOMAIN_KEYS);
    const intentScores = emptyScores(INTENT_KEYS);

    scorePhase(input, domainScores);
    scoreNeed(input, domainScores);
    scoreGaps(input, domainScores);
    scoreBarriers(input, domainScores);
    scoreIntent(input, intentScores);

    const network = classifyNetwork(input);
    applyInteractions(input, domainScores, intentScores, network);

    const rankedDomains = rank(domainScores);
    const rankedIntents = rank(intentScores);

    const primary = rankedDomains[0] && rankedDomains[0][1] >= 6
      ? rankedDomains[0][0]
      : null;

    const secondary = primary
      ? rankedDomains.slice(1)
          .filter(([, v]) => v >= 4 && primary && domainScores[primary] - v <= 3)
          .map(([k]) => k)
      : rankedDomains.filter(([, v]) => v >= 4).slice(0, 3).map(([k]) => k);

    const confidence = classifyConfidence(rankedDomains, network);
    const intent = classifyIntent(intentScores);
    const priority = classifyPriority(input, domainScores, network);

    return {
      version: DATA.VERSION,
      phase: input.phase || null,
      need: input.need || null,
      network,
      gaps: asArray(input.gaps),
      barriers: asArray(input.barriers),
      intent: intent.primary,
      secondary_intents: intent.secondary,
      domains: rankedDomains.map(([key, score]) => ({ key, label: DATA.DOMAINS[key], score })),
      primary_domain: primary,
      secondary_domains: secondary,
      priority,
      constraints: buildConstraints(input),
      confidence,
      scores: {
        domain: domainScores,
        intent: intentScores
      },
      safety_gate: {
        status: "NOT_IMPLEMENTED",
        note: "P1 richiede una domanda di sicurezza dedicata prima di poter essere assegnata."
      }
    };
  }

  window.AtlasEngine = {
    buildProfile,
    classifyNetwork,
    domainLabel: key => DATA.DOMAINS[key] || key,
    intentLabel: key => DATA.INTENTS[key] || key
  };
})();
