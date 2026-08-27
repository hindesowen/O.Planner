import { ClassItem, Assignment } from '../types';

export const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'cls-1',
    name: 'Academic Writing & Rhetoric',
    code: 'ENG 101',
    color: '#6366F1', // Indigo
    instructor: 'Dr. Evelyn Martinez',
  },
  {
    id: 'cls-2',
    name: 'Digital Photography & Lighting',
    code: 'ART 240',
    color: '#A855F7', // Purple
    instructor: 'Prof. Leo Vance',
  },
  {
    id: 'cls-3',
    name: 'Film History & Cinematography',
    code: 'FILM 110',
    color: '#EC4899', // Pink
    instructor: 'Sarah Jenkins',
  },
  {
    id: 'cls-4',
    name: 'Data Structures & Algorithms',
    code: 'CS 210',
    color: '#10B981', // Emerald
    instructor: 'Prof. Alan Zhao',
  },
  {
    id: 'cls-5',
    name: 'Modern World History',
    code: 'HIST 150',
    color: '#F59E0B', // Amber
    instructor: 'Dr. Marcus Cole',
  },
];

export const AVAILABLE_TAGS = [
  { name: 'writing', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { name: 'reading', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { name: 'photo', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { name: 'film', color: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  { name: 'video', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { name: 'easy', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { name: 'project', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { name: 'research', color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { name: 'code', color: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
];

const getFutureDate = (daysAhead: number, hour: number = 23, minute: number = 59): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString().slice(0, 16);
};

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Research Paper: Modern AI Ethics & Cognitive Impact',
    classId: 'cls-1',
    dueDate: getFutureDate(5, 18, 0),
    notes: 'Comprehensive multi-part research project. Minimum 6 peer-reviewed citations. Submit intermediate steps on Canvas portal: https://canvas.university.edu/ethics-paper',
    estimatedTime: '6 hours',
    tags: ['writing', 'research', 'project'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    steps: [
      {
        id: 'step-1',
        title: 'Formulate thesis statement & annotate 5 sources',
        dueDate: getFutureDate(1, 18, 0),
        completed: true,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'step-2',
        title: 'Draft complete section outlines & argument structure',
        dueDate: getFutureDate(2, 20, 0),
        completed: false,
      },
      {
        id: 'step-3',
        title: 'Write full body draft (minimum 2,500 words)',
        dueDate: getFutureDate(4, 23, 59),
        completed: false,
      },
      {
        id: 'step-4',
        title: 'Conduct peer review & format APA citations',
        dueDate: getFutureDate(5, 18, 0),
        completed: false,
      },
    ],
  },
  {
    id: 'asg-2',
    title: 'Portraits in Natural Golden Hour Light',
    classId: 'cls-2',
    dueDate: getFutureDate(2, 17, 30),
    notes: 'Submit 5 edited RAW files in Lightroom. Focus on rim lighting and aperture f/1.8 depth-of-field. Export as high-res JPEGs.',
    estimatedTime: '3 hours',
    tags: ['photo', 'project'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    steps: [
      {
        id: 'step-201',
        title: 'Scout outdoor location & schedule portrait model',
        dueDate: getFutureDate(1, 16, 0),
        completed: true,
      },
      {
        id: 'step-202',
        title: 'Capture 50+ RAW shots during 30-min golden hour window',
        dueDate: getFutureDate(2, 17, 30),
        completed: false,
      },
      {
        id: 'step-203',
        title: 'Color grade & export top 5 selections in Lightroom',
        dueDate: getFutureDate(2, 22, 0),
        completed: false,
      },
    ],
  },
  {
    id: 'asg-3',
    title: 'Short Film Scene Analysis: "In the Mood for Love"',
    classId: 'cls-3',
    dueDate: getFutureDate(3, 22, 0),
    notes: 'Write 800 words analyzing Wong Kar-wai color palette, slow-motion framing, and musical leitmotifs.',
    estimatedTime: '1.5 hours',
    tags: ['film', 'writing', 'video'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'asg-4',
    title: 'Binary Search Tree Balancing Exercises',
    classId: 'cls-4',
    dueDate: getFutureDate(4, 23, 59),
    notes: 'Complete problem sets 4.1 through 4.5 in textbook. Implement AVL rotation in Python: https://github.com/cs210/hw4',
    estimatedTime: '2.5 hours',
    tags: ['code', 'easy'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'asg-5',
    title: 'Read Chapters 7 & 8: Post-War Reconstruction',
    classId: 'cls-5',
    dueDate: getFutureDate(0, 20, 0), // Today
    notes: 'Prepare 3 discussion questions for seminar on the Marshall Plan.',
    estimatedTime: '45 mins',
    tags: ['reading', 'easy'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'asg-6',
    title: 'Studio Lighting Setup Exercise #2',
    classId: 'cls-2',
    dueDate: getFutureDate(6, 14, 0),
    notes: 'Book studio time slot B. Test 3-point lighting setup with softbox and honeycomb grid.',
    estimatedTime: '1 hour',
    tags: ['photo', 'easy'],
    completed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'asg-7',
    title: 'Introductory Peer Review Questionnaire',
    classId: 'cls-1',
    dueDate: getFutureDate(-1, 23, 59), // Yesterday (completed)
    notes: 'Submitted peer review feedback for Sarah and Marcus.',
    estimatedTime: '30 mins',
    tags: ['writing', 'easy'],
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];
