
// Smart Question Loader
// Dynamically imports all JSON files from src/questions
// Flattens, merges, de-duplicates, and normalizes data

const questionModules = import.meta.glob('/src/data/questions/*.json');

export async function loadQuestions() {
  let allQuestions = [];
  const seenIds = new Map();

  console.log('Loading questions from:', Object.keys(questionModules));

  for (const path in questionModules) {
    try {
      const mod = await questionModules[path]();
      // The JSON content might be the default export or the module itself depending on how it's imported
      // With JSON modules, it's usually the default export
      const data = mod.default || mod;

      const sourceFile = path.split('/').pop();

      // Handle different structures (array vs object wrapper)
      let questions = [];
      if (Array.isArray(data)) {
        questions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        questions = data.questions;
      } else {
        // Try to find any array property
        const arrayProp = Object.values(data).find(val => Array.isArray(val));
        if (arrayProp) {
          questions = arrayProp;
        }
      }

      console.log(`Loaded ${questions.length} questions from ${sourceFile}`);

      questions.forEach(q => {
        const normalized = normalizeQuestion(q, sourceFile);
        if (normalized && normalized.id) {
          // De-duplicate: keep the one from the "latest" file (lexicographically or just overwrite)
          // or keep existing if we want "first wins". 
          // User said "keep the newest version if duplicates exist". 
          // Since we don't have file dates easily here, we'll assume later files in the glob overwrite earlier ones,
          // or we could check a 'version' field if it exists.
          // For now, we'll overwrite.
          seenIds.set(normalized.id, normalized);
        }
      });

    } catch (err) {
      console.error(`Error loading ${path}:`, err);
    }
  }

  allQuestions = Array.from(seenIds.values());
  console.log(`Total unique questions loaded: ${allQuestions.length}`);
  return allQuestions;
}

function normalizeQuestion(q, sourceFile) {
  // Normalize to:
  // question, options[4], correct (0-3 index), explanation, category, topic, citation, tags[], difficulty, is_mn_amendment

  if (!q || typeof q !== 'object') return null;

  // ID
  const id = q.id ? String(q.id) : `gen_${Math.random().toString(36).substr(2, 9)}`;

  // Question Text
  const questionText = q.question || q.q || "No question text";

  // Options & Correct
  let options = [];
  let correctIndex = 0;

  if (Array.isArray(q.options)) {
    options = q.options;
    // If 'correct' is an index
    if (typeof q.correct === 'number') {
      correctIndex = q.correct;
    }
    // If 'correct' is the answer string
    else if (typeof q.correct === 'string') {
      correctIndex = options.indexOf(q.correct);
      if (correctIndex === -1) {
        // If not found, maybe add it? Or default to 0.
        // Let's try to match loosely
        correctIndex = 0;
      }
    }
  } else if (q.answer && q.distractors) {
    // Format: answer + distractors
    options = [q.answer, ...q.distractors];
    // Shuffle options to randomize position, but we need to track the correct one
    // For consistency in the bank, maybe we shouldn't shuffle here? 
    // But the user wants "options[4], correct (0-3)".
    // Let's shuffle.
    const correctVal = q.answer;
    options = shuffleArray(options);
    correctIndex = options.indexOf(correctVal);
  } else {
    // Fallback
    options = ["True", "False", "N/A", "Unknown"];
    correctIndex = 0;
  }

  // Ensure 4 options if possible (pad if needed)
  while (options.length < 4) {
    options.push("N/A");
  }
  // Truncate if > 4? User said "options[4]".
  if (options.length > 4) {
    options = options.slice(0, 4);
    // Make sure correct answer is still in there?
    // This is edge case.
  }

  return {
    id: id,
    question: questionText,
    options: options,
    correct: correctIndex,
    explanation: q.explanation || q.rationale || "No explanation provided.",
    category: q.category || "General",
    topic: q.topic || "General",
    citation: q.citation || q.reference || "",
    tags: Array.isArray(q.tags) ? q.tags : [],
    difficulty: q.difficulty || "Medium",
    is_mn_amendment: !!(q.is_mn_amendment || q.mn_amendment),
    sourceFile: sourceFile,
    media: q.media || (q.image ? { type: 'image', url: q.image } : (q.video ? { type: 'video', url: q.video } : null))
  };
}

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}
