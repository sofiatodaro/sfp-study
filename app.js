/* =========================================================
   SFP STUDY — APP.JS
   PARTE 1 DI 3
   Dati iniziali, navigazione, Home e funzioni principali
========================================================= */

const modules = [
  {
    id: "M1",
    name: "Comprensione del testo",
    chapters: 5
  },
  {
    id: "M2",
    name: "Grammatica italiana",
    chapters: 15
  },
  {
    id: "M3",
    name: "Logica",
    chapters: 6
  },
  {
    id: "M4",
    name: "Letteratura italiana",
    chapters: 8
  },
  {
    id: "M5",
    name: "Storia",
    chapters: 9
  },
  {
    id: "M6",
    name: "Geografia",
    chapters: 9
  },
  {
    id: "M7",
    name: "Matematica",
    chapters: 8
  },
  {
    id: "M8",
    name: "Scienze",
    chapters: 8
  },
  {
    id: "M9",
    name: "Ripasso e simulazioni",
    chapters: 14
  }
];

/* Capitoli del Modulo 2 già svolti con certezza */
const initialCompletedChapters = [
  "M2-C1",
  "M2-C2",
  "M2-C3",
  "M2-C4",
  "M2-C5",
  "M2-C6",
  "M2-C7",
  "M2-C8",
  "M2-C9"
];

/* Capitoli già presenti sul quaderno */
const initialNotebookChapters = [
  "M2-C1",
  "M2-C2",
  "M2-C3",
  "M2-C4",
  "M2-C5",
  "M2-C6",
  "M2-C7",
  "M2-C8",
  "M2-C9"
];

/* Dati iniziali confermati */
const initialState = {
  completedChapters: initialCompletedChapters,

  notebookChapters: initialNotebookChapters,

  quizScores: {
    "M2-C9-P2": 29.5
  },

  securityLevels: {
    "M2-C9-P2": 5
  },

  simulations: [],

  calendarShift: 0
};

const storageKey = "sfp-study-simple-history";

let appState = loadState();

/* =========================================================
   FUNZIONI GENERALI
========================================================= */

function loadState() {
  const savedState = localStorage.getItem(storageKey);

  if (!savedState) {
    return structuredClone(initialState);
  }

  try {
    const parsedState = JSON.parse(savedState);

    return {
      completedChapters:
        parsedState.completedChapters ??
        structuredClone(initialCompletedChapters),

      notebookChapters:
        parsedState.notebookChapters ??
        structuredClone(initialNotebookChapters),

      quizScores:
        parsedState.quizScores ??
        {
          "M2-C9-P2": 29.5
        },

      securityLevels:
        parsedState.securityLevels ??
        {
          "M2-C9-P2": 5
        },

      simulations:
        parsedState.simulations ?? [],

      calendarShift:
        parsedState.calendarShift ?? 0
    };
  } catch (error) {
    console.error("Errore durante il caricamento dei dati:", error);

    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(
    storageKey,
    JSON.stringify(appState)
  );
}

function getElement(id) {
  return document.getElementById(id);
}

function getAllChapters() {
  return modules.flatMap(module =>
    Array.from(
      {
        length: module.chapters
      },
      (_, index) => ({
        id: `${module.id}-C${index + 1}`,
        moduleId: module.id,
        moduleName: module.name,
        chapterNumber: index + 1
      })
    )
  );
}

function getChapterLabel(chapterId) {
  const chapter = getAllChapters().find(
    item => item.id === chapterId
  );

  if (!chapter) {
    return chapterId;
  }

  return `${chapter.moduleId} · Capitolo ${chapter.chapterNumber}`;
}

function getModuleName(moduleId) {
  const module = modules.find(
    item => item.id === moduleId
  );

  return module?.name ?? moduleId;
}

function isChapterCompleted(chapterId) {
  return appState.completedChapters.includes(
    chapterId
  );
}

function isNotebookUpdated(chapterId) {
  return appState.notebookChapters.includes(
    chapterId
  );
}

function calculateAverage(values) {
  if (!values.length) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + Number(value),
    0
  );

  return total / values.length;
}

function formatDecimal(value) {
  return Number(value)
    .toFixed(1)
    .replace(".", ",");
}

/* =========================================================
   NAVIGAZIONE
========================================================= */

function initializeNavigation() {
  const navigationButtons =
    document.querySelectorAll(
      ".navigation-button"
    );

  navigationButtons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const targetPage =
          button.dataset.page;

        openPage(targetPage);
      }
    );
  });
}

function openPage(pageId) {
  const pages =
    document.querySelectorAll(".page");

  const navigationButtons =
    document.querySelectorAll(
      ".navigation-button"
    );

  pages.forEach(page => {
    page.classList.toggle(
      "active",
      page.id === pageId
    );
  });

  navigationButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   HOME
========================================================= */

function renderHome() {
  const chapters = getAllChapters();

  const completedCount =
    chapters.filter(chapter =>
      isChapterCompleted(chapter.id)
    ).length;

  const percentage =
    Math.round(
      completedCount /
      chapters.length *
      100
    );

  const quizValues =
    Object.values(
      appState.quizScores
    ).filter(value =>
      Number(value) > 0
    );

  const securityValues =
    Object.values(
      appState.securityLevels
    ).filter(value =>
      Number(value) > 0
    );

  const quizAverage =
    calculateAverage(quizValues);

  const securityAverage =
    calculateAverage(securityValues);

  getElement(
    "completedChapters"
  ).textContent =
    completedCount;

  getElement(
    "overallPercentage"
  ).textContent =
    `${percentage}%`;

  getElement(
    "overallProgress"
  ).style.width =
    `${percentage}%`;

  getElement(
    "quizAverage"
  ).textContent =
    quizAverage === null
      ? "—"
      : formatDecimal(quizAverage);

  getElement(
    "securityAverage"
  ).textContent =
    securityAverage === null
      ? "—"
      : `${formatDecimal(securityAverage)}/5`;

  getElement(
    "notebookChapters"
  ).textContent =
    appState.notebookChapters.length;

  renderNextChapter();
}

function renderNextChapter() {
  const nextChapter =
    getAllChapters().find(
      chapter =>
        !isChapterCompleted(
          chapter.id
        )
    );

  const container =
    getElement("nextChapter");

  if (!nextChapter) {
    container.innerHTML = `
      <span class="status status-completed">
        Percorso completato
      </span>
    `;

    return;
  }

  container.innerHTML = `
    <strong>
      ${nextChapter.moduleId}
      · Capitolo
      ${nextChapter.chapterNumber}
    </strong>

    <div class="register-meta">
      ${nextChapter.moduleName}
    </div>
  `;
}

/* =========================================================
   AGGIORNAMENTO COMPLETO
========================================================= */

function renderApplication() {
  renderHome();

  if (
    typeof renderCalendar ===
    "function"
  ) {
    renderCalendar();
  }

  if (
    typeof renderRegister ===
    "function"
  ) {
    renderRegister();
  }

  if (
    typeof renderSimulations ===
    "function"
  ) {
    renderSimulations();
  }
}

/* =========================================================
   AVVIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeNavigation();
    renderApplication();
  }
);


/* =========================================================
   SFP STUDY — APP.JS
   PARTE 2 DI 3
   Calendario, Registro e Simulazioni
========================================================= */

/* =========================================================
   CALENDARIO
========================================================= */

const studyPlan = [
  {
    date: "2026-07-13",
    chapters: [
      "M2-C9",
      "M2-C10",
      "M2-C11",
      "M2-C12"
    ]
  },
  {
    date: "2026-07-14",
    chapters: [
      "M2-C13",
      "M2-C14",
      "M2-C15"
    ]
  },
  {
    date: "2026-07-15",
    chapters: [
      "M1-C4",
      "M1-C5",
      "M3-C1",
      "M3-C2"
    ]
  },
  {
    date: "2026-07-16",
    chapters: [
      "M3-C3",
      "M3-C4",
      "M3-C5",
      "M3-C6"
    ]
  },
  {
    date: "2026-07-17",
    chapters: [
      "M4-C1",
      "M4-C2",
      "M4-C3",
      "M4-C4"
    ]
  },
  {
    date: "2026-07-20",
    chapters: [
      "M4-C5",
      "M4-C6",
      "M4-C7",
      "M4-C8"
    ]
  },
  {
    date: "2026-07-21",
    chapters: [
      "M5-C1",
      "M5-C2",
      "M5-C3",
      "M5-C4"
    ]
  },
  {
    date: "2026-07-22",
    chapters: [
      "M5-C5",
      "M5-C6",
      "M5-C7",
      "M5-C8"
    ]
  },
  {
    date: "2026-07-23",
    chapters: [
      "M5-C9",
      "M6-C1",
      "M6-C2",
      "M6-C3"
    ]
  },
  {
    date: "2026-07-24",
    chapters: [
      "M6-C4",
      "M6-C5",
      "M6-C6",
      "M6-C7"
    ]
  },
  {
    date: "2026-07-27",
    chapters: [
      "M6-C8",
      "M6-C9",
      "M7-C1",
      "M7-C2"
    ]
  },
  {
    date: "2026-07-28",
    chapters: [
      "M7-C3",
      "M7-C4",
      "M7-C5",
      "M7-C6"
    ]
  },
  {
    date: "2026-07-29",
    chapters: [
      "M7-C7",
      "M7-C8",
      "M8-C1",
      "M8-C2"
    ]
  },
  {
    date: "2026-07-30",
    chapters: [
      "M8-C3",
      "M8-C4",
      "M8-C5",
      "M8-C6"
    ]
  },
  {
    date: "2026-07-31",
    chapters: [
      "M8-C7",
      "M8-C8",
      "M9-C1",
      "M9-C2"
    ]
  },
  {
    date: "2026-08-03",
    chapters: [
      "M9-C3",
      "M9-C4",
      "M9-C5",
      "M9-C6"
    ]
  },
  {
    date: "2026-08-04",
    chapters: [
      "M9-C7",
      "M9-C8",
      "M9-C9",
      "M9-C10"
    ]
  },
  {
    date: "2026-08-05",
    chapters: [
      "M9-C11",
      "M9-C12",
      "M9-C13",
      "M9-C14"
    ]
  }
];

function addDaysToDate(
  dateString,
  numberOfDays
) {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  date.setDate(
    date.getDate() + numberOfDays
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function formatDate(dateString) {
  const date = new Date(
    `${dateString}T12:00:00`
  );

  return new Intl.DateTimeFormat(
    "it-IT",
    {
      weekday: "short",
      day: "numeric",
      month: "short"
    }
  ).format(date);
}

function getAdjustedStudyPlan() {
  return studyPlan.map(day => ({
    date: addDaysToDate(
      day.date,
      appState.calendarShift
    ),

    chapters: day.chapters
  }));
}

function renderCalendar() {
  const tableBody =
    getElement("calendarTable");

  const adjustedPlan =
    getAdjustedStudyPlan();

  tableBody.innerHTML =
    adjustedPlan
      .map(day => {
        const completedNumber =
          day.chapters.filter(
            chapterId =>
              isChapterCompleted(
                chapterId
              )
          ).length;

        const allCompleted =
          completedNumber ===
          day.chapters.length;

        const statusClass =
          allCompleted
            ? "status-completed"
            : "status-pending";

        const statusLabel =
          allCompleted
            ? "Completato"
            : completedNumber > 0
              ? `${completedNumber}/${day.chapters.length}`
              : "Da fare";

        const chapterLabels =
          day.chapters
            .map(chapterId =>
              getChapterLabel(
                chapterId
              )
            )
            .join("<br>");

        return `
          <tr>
            <td>
              ${formatDate(day.date)}
            </td>

            <td>
              ${chapterLabels}
            </td>

            <td>
              <span
                class="
                  status
                  ${statusClass}
                "
              >
                ${statusLabel}
              </span>
            </td>
          </tr>
        `;
      })
      .join("");
}

/* =========================================================
   REGISTRO
========================================================= */

function findScoreKey(chapterId) {
  return Object.keys(
    appState.quizScores
  ).find(key =>
    key.startsWith(
      `${chapterId}-`
    )
  );
}

function findSecurityKey(chapterId) {
  return Object.keys(
    appState.securityLevels
  ).find(key =>
    key.startsWith(
      `${chapterId}-`
    )
  );
}

function getChapterScore(chapterId) {
  const key =
    findScoreKey(chapterId);

  if (!key) {
    return "";
  }

  return appState.quizScores[key];
}

function getChapterSecurity(
  chapterId
) {
  const key =
    findSecurityKey(chapterId);

  if (!key) {
    return "";
  }

  return appState
    .securityLevels[key];
}

function renderRegister() {
  const container =
    getElement("registerList");

  const chapters =
    getAllChapters();

  container.innerHTML =
    chapters
      .map(chapter => {
        const completed =
          isChapterCompleted(
            chapter.id
          );

        const notebookUpdated =
          isNotebookUpdated(
            chapter.id
          );

        const score =
          getChapterScore(
            chapter.id
          );

        const security =
          getChapterSecurity(
            chapter.id
          );

        return `
          <div class="register-row">

            <div class="register-info">

              <div class="register-title">
                ${chapter.moduleId}
                · Capitolo
                ${chapter.chapterNumber}
              </div>

              <div class="register-meta">
                ${chapter.moduleName}
              </div>

              <div class="register-meta">

                <span
                  class="
                    status
                    ${
                      completed
                        ? "status-completed"
                        : "status-pending"
                    }
                  "
                >
                  ${
                    completed
                      ? "Completato"
                      : "Da fare"
                  }
                </span>

                ${
                  notebookUpdated
                    ? `
                      <span
                        class="
                          status
                          status-notebook
                        "
                      >
                        📓 Quaderno
                      </span>
                    `
                    : ""
                }

              </div>

            </div>

            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              placeholder="Voto"
              value="${score}"
              aria-label="
                Voto ${chapter.id}
              "
              onchange="
                updateChapterScore(
                  '${chapter.id}',
                  this.value
                )
              "
            >

            <select
              aria-label="
                Sicurezza ${chapter.id}
              "
              onchange="
                updateChapterSecurity(
                  '${chapter.id}',
                  this.value
                )
              "
            >

              ${createSecurityOptions(
                security
              )}

            </select>

            <div class="checkbox-cell">

              <input
                type="checkbox"
                title="Capitolo completato"
                ${
                  completed
                    ? "checked"
                    : ""
                }
                onchange="
                  updateChapterCompletion(
                    '${chapter.id}',
                    this.checked
                  )
                "
              >

            </div>

            <div class="checkbox-cell">

              <input
                type="checkbox"
                title="Quaderno aggiornato"
                ${
                  notebookUpdated
                    ? "checked"
                    : ""
                }
                onchange="
                  updateNotebookStatus(
                    '${chapter.id}',
                    this.checked
                  )
                "
              >

            </div>

          </div>
        `;
      })
      .join("");
}

function createSecurityOptions(
  selectedValue
) {
  const values = [
    "",
    "1",
    "2",
    "3",
    "4",
    "5"
  ];

  return values
    .map(value => {
      const selected =
        String(selectedValue) ===
        value
          ? "selected"
          : "";

      const label =
        value === ""
          ? "Sicurezza"
          : "⭐".repeat(
              Number(value)
            );

      return `
        <option
          value="${value}"
          ${selected}
        >
          ${label}
        </option>
      `;
    })
    .join("");
}

function updateChapterScore(
  chapterId,
  value
) {
  const existingKey =
    findScoreKey(chapterId);

  if (
    value === "" ||
    value === null
  ) {
    if (existingKey) {
      delete appState
        .quizScores[existingKey];
    }
  } else {
    const scoreKey =
      existingKey ??
      `${chapterId}-P1`;

    appState.quizScores[
      scoreKey
    ] = Number(value);
  }

  saveState();
  renderApplication();
}

function updateChapterSecurity(
  chapterId,
  value
) {
  const existingKey =
    findSecurityKey(
      chapterId
    );

  if (
    value === "" ||
    value === null
  ) {
    if (existingKey) {
      delete appState
        .securityLevels[
          existingKey
        ];
    }
  } else {
    const securityKey =
      existingKey ??
      `${chapterId}-P1`;

    appState.securityLevels[
      securityKey
    ] = Number(value);
  }

  saveState();
  renderApplication();
}

function updateChapterCompletion(
  chapterId,
  completed
) {
  if (
    completed &&
    !appState
      .completedChapters
      .includes(chapterId)
  ) {
    appState
      .completedChapters
      .push(chapterId);
  }

  if (!completed) {
    appState.completedChapters =
      appState
        .completedChapters
        .filter(id =>
          id !== chapterId
        );
  }

  saveState();
  renderApplication();
}

function updateNotebookStatus(
  chapterId,
  updated
) {
  if (
    updated &&
    !appState
      .notebookChapters
      .includes(chapterId)
  ) {
    appState
      .notebookChapters
      .push(chapterId);
  }

  if (!updated) {
    appState.notebookChapters =
      appState
        .notebookChapters
        .filter(id =>
          id !== chapterId
        );
  }

  saveState();
  renderApplication();
}

/* Le funzioni devono essere
   disponibili dagli attributi
   onchange presenti nell'HTML */

window.updateChapterScore =
  updateChapterScore;

window.updateChapterSecurity =
  updateChapterSecurity;

window.updateChapterCompletion =
  updateChapterCompletion;

window.updateNotebookStatus =
  updateNotebookStatus;

/* =========================================================
   SIMULAZIONI
========================================================= */

function initializeSimulations() {
  const addButton =
    getElement("addSimulation");

  addButton.addEventListener(
    "click",
    addSimulation
  );
}

function addSimulation() {
  const date =
    getElement(
      "simulationDate"
    ).value;

  const score =
    getElement(
      "simulationScore"
    ).value;

  const time =
    getElement(
      "simulationTime"
    ).value;

  const errors =
    getElement(
      "simulationErrors"
    ).value;

  if (!date) {
    alert(
      "Inserisci la data della simulazione."
    );

    return;
  }

  appState.simulations.push({
    id: Date.now(),
    date,
    score:
      score === ""
        ? ""
        : Number(score),
    time:
      time === ""
        ? ""
        : Number(time),
    errors:
      errors === ""
        ? ""
        : Number(errors)
  });

  saveState();

  clearSimulationForm();
  renderApplication();
}

function clearSimulationForm() {
  getElement(
    "simulationDate"
  ).value = "";

  getElement(
    "simulationScore"
  ).value = "";

  getElement(
    "simulationTime"
  ).value = "";

  getElement(
    "simulationErrors"
  ).value = "";
}

function renderSimulations() {
  const tableBody =
    getElement(
      "simulationTable"
    );

  if (
    appState.simulations
      .length === 0
  ) {
    tableBody.innerHTML = `
      <tr>
        <td
          colspan="4"
          class="empty-message"
        >
          Nessuna simulazione
          ancora registrata.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML =
    [...appState.simulations]
      .reverse()
      .map(simulation => `
        <tr>

          <td>
            ${formatDate(
              simulation.date
            )}
          </td>

          <td>
            ${
              simulation.score === ""
                ? "—"
                : simulation.score
            }
          </td>

          <td>
            ${
              simulation.time === ""
                ? "—"
                : `${simulation.time} min`
            }
          </td>

          <td>
            ${
              simulation.errors === ""
                ? "—"
                : simulation.errors
            }
          </td>

        </tr>
      `)
      .join("");
}


/* =========================================================
   SFP STUDY — APP.JS
   PARTE 3 DI 3
   Backup, ripristino, avvio finale
========================================================= */

/* =========================================================
   BACKUP
========================================================= */

function initializeBackup() {
  const exportButton =
    getElement("exportBackup");

  const importInput =
    getElement("importBackup");

  exportButton.addEventListener(
    "click",
    exportBackup
  );

  importInput.addEventListener(
    "change",
    importBackup
  );
}

function exportBackup() {
  const backupContent =
    JSON.stringify(
      appState,
      null,
      2
    );

  const backupBlob =
    new Blob(
      [backupContent],
      {
        type: "application/json"
      }
    );

  const downloadLink =
    document.createElement("a");

  const objectUrl =
    URL.createObjectURL(
      backupBlob
    );

  downloadLink.href =
    objectUrl;

  downloadLink.download =
    "sfp-study-backup.json";

  document.body.appendChild(
    downloadLink
  );

  downloadLink.click();

  downloadLink.remove();

  URL.revokeObjectURL(
    objectUrl
  );
}

function importBackup(event) {
  const selectedFile =
    event.target.files[0];

  if (!selectedFile) {
    return;
  }

  const reader =
    new FileReader();

  reader.addEventListener(
    "load",
    () => {
      try {
        const importedData =
          JSON.parse(
            reader.result
          );

        if (
          !importedData ||
          !Array.isArray(
            importedData.completedChapters
          ) ||
          !Array.isArray(
            importedData.notebookChapters
          )
        ) {
          throw new Error(
            "Formato non valido"
          );
        }

        appState = {
          completedChapters:
            importedData.completedChapters,

          notebookChapters:
            importedData.notebookChapters,

          quizScores:
            importedData.quizScores ??
            {},

          securityLevels:
            importedData.securityLevels ??
            {},

          simulations:
            importedData.simulations ??
            [],

          calendarShift:
            importedData.calendarShift ??
            0
        };

        saveState();
        renderApplication();

        alert(
          "Backup importato correttamente."
        );
      } catch (error) {
        console.error(
          "Errore importazione:",
          error
        );

        alert(
          "Il file selezionato non è un backup valido di SFP Study."
        );
      } finally {
        event.target.value = "";
      }
    }
  );

  reader.readAsText(
    selectedFile
  );
}

/* =========================================================
   PROTEZIONE DATI INIZIALI
========================================================= */

function ensureHistoricalData() {
  initialCompletedChapters
    .forEach(chapterId => {
      if (
        !appState
          .completedChapters
          .includes(chapterId)
      ) {
        appState
          .completedChapters
          .push(chapterId);
      }
    });

  initialNotebookChapters
    .forEach(chapterId => {
      if (
        !appState
          .notebookChapters
          .includes(chapterId)
      ) {
        appState
          .notebookChapters
          .push(chapterId);
      }
    });

  if (
    appState.quizScores[
      "M2-C9-P2"
    ] === undefined
  ) {
    appState.quizScores[
      "M2-C9-P2"
    ] = 29.5;
  }

  if (
    appState.securityLevels[
      "M2-C9-P2"
    ] === undefined
  ) {
    appState.securityLevels[
      "M2-C9-P2"
    ] = 5;
  }

  saveState();
}

/* =========================================================
   COMPATIBILITÀ
========================================================= */

function provideStructuredCloneFallback() {
  if (
    typeof structuredClone ===
    "function"
  ) {
    return;
  }

  window.structuredClone =
    value =>
      JSON.parse(
        JSON.stringify(value)
      );
}

/* =========================================================
   AVVIO DEFINITIVO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    provideStructuredCloneFallback();

    ensureHistoricalData();

    initializeNavigation();
    initializeSimulations();
    initializeBackup();

    renderApplication();
  }
);
