'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { GeneratedPaper, Assignment } from '@/types';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 50,
    color: '#2f2f2f',
    backgroundColor: '#fff',
  },

  /* ── Paper header ── */
  headerBox: {
    borderBottom: '1pt solid #e0e0e0',
    paddingBottom: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  schoolName: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  headerNote: {
    fontSize: 9,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },

  /* ── Student fields ── */
  studentFields: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: '0.5pt dashed #ccc',
  },
  studentField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: 110,
    color: '#2f2f2f',
  },
  fieldLine: {
    flex: 1,
    borderBottom: '0.75pt solid #2f2f2f',
    maxWidth: 160,
  },

  /* ── Section ── */
  sectionContainer: { marginTop: 18 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  sectionInstruction: {
    fontSize: 9,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 10,
  },

  /* ── Question: inline format ── */
  questionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  qNum: {
    width: 24,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    paddingRight: 6,
    color: '#2f2f2f',
  },
  qBody: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.6,
    color: '#2f2f2f',
  },

  /* ── Footer ── */
  footer: {
    marginTop: 18,
    borderTop: '0.5pt solid #e0e0e0',
    paddingTop: 8,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#2f2f2f',
  },

  /* ── Answer Key ── */
  answerKeyContainer: {
    marginTop: 20,
    borderTop: '1pt dashed #ccc',
    paddingTop: 14,
  },
  answerKeyTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    color: '#2f2f2f',
  },
  answerSectionLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    color: '#2f2f2f',
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  answerNum: {
    width: 24,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
    paddingRight: 6,
    color: '#555',
  },
  answerText: {
    flex: 1,
    fontSize: 9,
    color: '#444',
    lineHeight: 1.6,
  },

  /* ── Page number ── */
  pageNum: {
    position: 'absolute',
    bottom: 24,
    right: 50,
    fontSize: 8,
    color: '#aaa',
  },
});

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  challenging: 'Challenging',
};

interface Props {
  paper: GeneratedPaper;
  assignment: Assignment;
  includeAnswers?: boolean;
}

export function PaperPDFDocument({ paper, assignment, includeAnswers = false }: Props) {
  return (
    <Document
      title={`${assignment.title} — ${assignment.schoolName}`}
      author={assignment.schoolName}
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.headerBox}>
          <Text style={s.schoolName}>{assignment.schoolName}</Text>
          <Text style={s.headerMeta}>Subject: {assignment.subject}</Text>
          <Text style={s.headerMeta}>Class: {assignment.className}</Text>
          <View style={s.headerRow}>
            <Text style={s.headerMeta}>Time Allowed: {paper.timeAllowed} minutes</Text>
            <Text style={s.headerMeta}>Maximum Marks: {paper.totalMarks}</Text>
          </View>
          <Text style={s.headerNote}>
            All questions are compulsory unless stated otherwise.
          </Text>
        </View>

        {/* ── Student fields ── */}
        <View style={s.studentFields}>
          {['Name', 'Roll Number', 'Class 5th Section'].map((f) => (
            <View key={f} style={s.studentField}>
              <Text style={s.fieldLabel}>{f}:</Text>
              <View style={s.fieldLine} />
            </View>
          ))}
        </View>

        {/* ── Sections ── */}
        {paper.sections.map((section, sIdx) => (
          <View key={sIdx} style={s.sectionContainer} wrap={false}>
            <Text style={s.sectionLabel}>{section.label}</Text>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <Text style={s.sectionInstruction}>{section.instruction}</Text>

            {section.questions.map((q, qIdx) => {
              const diffLabel = DIFF_LABELS[q.difficulty] || 'Moderate';
              return (
                <View key={q.id} style={s.questionRow}>
                  <Text style={s.qNum}>{qIdx + 1}.</Text>
                  <Text style={s.qBody}>
                    [{diffLabel}] {q.text} [{q.marks} Marks]
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={s.footer}>End of Question Paper</Text>

        {/* ── Answer Key ── */}
        {includeAnswers && (
          <View style={s.answerKeyContainer} break>
            <Text style={s.answerKeyTitle}>Answer Key:</Text>

            {paper.sections.map((section, sIdx) => (
              <View key={sIdx} style={{ marginBottom: 12 }}>
                <Text style={s.answerSectionLabel}>
                  {section.label} — {section.title}
                </Text>
                {section.questions.map((q, qIdx) => (
                  <View key={q.id} style={s.answerRow}>
                    <Text style={s.answerNum}>{qIdx + 1}.</Text>
                    <Text style={s.answerText}>{q.answer || '—'}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        <Text
          style={s.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
