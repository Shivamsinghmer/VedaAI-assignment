import Groq from 'groq-sdk';
import { CreateAssignmentDTO, GeneratedPaper, GeneratedSection, GeneratedQuestion, Difficulty, QuestionTypeName } from '../types';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SECTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const MODEL = 'llama-3.3-70b-versatile';

function buildPrompt(data: CreateAssignmentDTO, fileText?: string): string {
  const totalQ = data.questionTypes.reduce((s, qt) => s + qt.count, 0);
  const totalM = data.questionTypes.reduce((s, qt) => s + qt.count * qt.marksPerQuestion, 0);

  const sections = data.questionTypes
    .map((qt, i) => {
      const label = SECTION_LABELS[i] || String.fromCharCode(65 + i);
      return `Section ${label}: ${qt.type} — ${qt.count} questions × ${qt.marksPerQuestion} marks each`;
    })
    .join('\n');

  const fileContext = fileText
    ? `\n\nReference material uploaded by the teacher (use this to generate contextually relevant questions):\n---\n${fileText.slice(0, 4000)}\n---`
    : '';

  return `You are an expert educational question paper generator. Generate a structured question paper in valid JSON.

Assignment Details:
- Title: ${data.title}
- Subject: ${data.subject}
- Class: ${data.className}
- School: ${data.schoolName}
- Time Allowed: ${data.timeAllowed || 60} minutes
- Total Questions: ${totalQ}
- Total Marks: ${totalM}
- Additional Instructions: ${data.additionalInstructions || 'None'}

Question Sections:
${sections}
${fileContext}

Return ONLY a valid JSON object with this exact structure (no markdown fences, no explanation):
{
  "aiMessage": "A brief friendly message to the teacher confirming the paper was generated",
  "totalQuestions": ${totalQ},
  "totalMarks": ${totalM},
  "timeAllowed": ${data.timeAllowed || 60},
  "sections": [
    {
      "label": "Section A",
      "title": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questionType": "Short Questions",
      "totalMarks": 20,
      "questions": [
        {
          "id": "q1",
          "text": "Full question text here",
          "difficulty": "easy",
          "marks": 2,
          "type": "Short Questions",
          "answer": "Model answer text"
        }
      ]
    }
  ]
}

Rules:
- difficulty must be exactly one of: "easy", "moderate", "challenging"
- Generate the exact number of questions specified for each section
- Make questions academically rigorous and appropriate for the class level
- Mix difficulty levels naturally (roughly 40% easy, 40% moderate, 20% challenging)
- Return ONLY the JSON object, nothing else

CRITICAL — Answer length and format MUST match the question type:
- MCQ / Multiple Choice Questions: provide the correct option letter AND a one-line explanation (e.g. "B) Mitochondria — it is the powerhouse of the cell")
- Fill in the Blanks: provide just the exact word or phrase that fills the blank
- True / False: state "True" or "False" followed by one sentence justification
- Short Questions (1–3 marks): write 2–4 concise sentences that directly answer the question
- Long Answer / Essay / Descriptive Questions (4+ marks): write a thorough, well-structured answer of at least 100–200 words with an introduction, key points explained in detail, and a conclusion — as a real student would write in an exam
- Diagram / Map / Graph / Chart / Label-based Questions: first write 2–3 sentences describing what the diagram should depict and what the student must draw, then list all key labels/parts the student must include (e.g. "The diagram should show the human heart in cross-section. Label: right atrium, left atrium, right ventricle, left ventricle, aorta, pulmonary artery, superior vena cava, bicuspid valve, tricuspid valve.")
- Case Study / Comprehension Questions: write a detailed analytical answer referencing key facts`;
}

interface RawQuestion {
  id?: string;
  text?: string;
  difficulty?: string;
  marks?: number;
  type?: string;
  answer?: string;
}

interface RawSection {
  label?: string;
  title?: string;
  instruction?: string;
  questionType?: string;
  questions?: RawQuestion[];
  totalMarks?: number;
}

interface RawPaper {
  aiMessage?: string;
  totalQuestions?: number;
  totalMarks?: number;
  timeAllowed?: number;
  sections?: RawSection[];
}

function parsePaper(raw: RawPaper, dto: CreateAssignmentDTO): GeneratedPaper {
  const sections: GeneratedSection[] = (raw.sections || []).map((sec, sIdx) => {
    const questions: GeneratedQuestion[] = (sec.questions || []).map((q, qIdx) => ({
      id: q.id || `${sIdx + 1}-${qIdx + 1}`,
      text: q.text || 'Question text unavailable',
      difficulty: (['easy', 'moderate', 'challenging'].includes(q.difficulty || '')
        ? q.difficulty
        : 'moderate') as Difficulty,
      marks: typeof q.marks === 'number' ? q.marks : dto.questionTypes[sIdx]?.marksPerQuestion || 1,
      type: (q.type || dto.questionTypes[sIdx]?.type || 'General') as QuestionTypeName,
      answer: q.answer,
    }));

    return {
      label: sec.label || `Section ${SECTION_LABELS[sIdx]}`,
      title: sec.title || dto.questionTypes[sIdx]?.type || 'Questions',
      instruction: sec.instruction || 'Attempt all questions.',
      questionType: (sec.questionType || dto.questionTypes[sIdx]?.type || 'General') as QuestionTypeName,
      questions,
      totalMarks: questions.reduce((s, q) => s + q.marks, 0),
    };
  });

  return {
    sections,
    totalQuestions: sections.reduce((s, sec) => s + sec.questions.length, 0),
    totalMarks: sections.reduce((s, sec) => s + sec.totalMarks, 0),
    timeAllowed: raw.timeAllowed || dto.timeAllowed || 60,
    aiMessage:
      raw.aiMessage ||
      `Here is your customized question paper for ${dto.subject}, ${dto.className}.`,
  };
}

export async function generatePaper(
  dto: CreateAssignmentDTO,
  fileText?: string
): Promise<GeneratedPaper> {
  const prompt = buildPrompt(dto, fileText);

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8000,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from Groq');

  let jsonStr = content.trim();
  // Strip markdown fences if model added them despite json_object format
  jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let raw: RawPaper;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse Groq response as JSON: ${jsonStr.slice(0, 200)}`);
  }

  return parsePaper(raw, dto);
}
