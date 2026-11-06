/**
 * NETFLOW Simulated MongoDB / Mongoose Database Store
 * Implements persistent schema collections, queries, updates, and seed data.
 */

import { User, Post, Community, Message, Conversation, NotificationItem, Quiz, PDFMaterial, LearningCategory } from '../types/index.js';

class InMemoryDB {
  public users: Map<string, User> = new Map();
  public posts: Map<string, Post> = new Map();
  public comments: Map<string, any[]> = new Map(); // postId -> comments[]
  public communities: Map<string, Community> = new Map();
  public communityDiscussions: Map<string, any[]> = new Map(); // communityId -> posts[]
  public messages: Map<string, Message[]> = new Map(); // conversationId -> messages[]
  public conversations: Map<string, Conversation> = new Map();
  public notifications: Map<string, NotificationItem[]> = new Map(); // userId -> notifications[]
  public quizzes: Map<string, Quiz> = new Map();
  public materials: Map<string, PDFMaterial> = new Map();
  public follows: Map<string, Set<string>> = new Map(); // userId -> Set<followingUserId>
  public bookmarks: Map<string, Set<string>> = new Map(); // userId -> Set<postId>
  public likes: Map<string, Set<string>> = new Map(); // postId -> Set<userId>

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Initial Users
    const elena: User = {
      id: 'u_elena',
      username: 'drelena',
      name: 'Dr. Elena Vance',
      email: 'elena.vance@stanford.edu',
      role: 'teacher',
      avatar: '/src/assets/images/avatar_dr_elena_1793940253325.jpg',
      bio: 'Professor of Quantum Physics & Computational STEM. Passionate about making deep physics intuitive through interactive models and open education.',
      institution: 'Stanford University',
      department: 'Department of Applied Physics',
      verifiedEducator: true,
      subjects: ['Physics', 'Mathematics', 'Artificial Intelligence'],
      followersCount: 14200,
      followingCount: 312,
      postsCount: 148,
      savedCount: 54,
      rating: 4.96,
      createdAt: '2025-01-10T12:00:00.000Z',
    };

    const marcus: User = {
      id: 'u_marcus',
      username: 'marcusthorne',
      name: 'Marcus Thorne',
      email: 'marcus@codecraft.org',
      role: 'creator',
      avatar: '/src/assets/images/avatar_marcus_dev_1793940254064.jpg',
      bio: 'Senior Software Architect & CS Educator. Teaching distributed systems, algorithms, and practical programming to 250k+ students worldwide.',
      institution: 'MIT Open Learning Fellow',
      department: 'Computer Science',
      verifiedEducator: true,
      subjects: ['Computer Science', 'Programming', 'Artificial Intelligence'],
      followersCount: 28900,
      followingCount: 198,
      postsCount: 230,
      savedCount: 89,
      rating: 4.98,
      createdAt: '2025-01-15T10:00:00.000Z',
    };

    const maya: User = {
      id: 'u_maya',
      username: 'mayabiology',
      name: 'Maya Patel, Ph.D.',
      email: 'maya.patel@cambridge.ac.uk',
      role: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Molecular Biologist & Geneticist. Exploring CRISPR, cellular pathways, and modern biotechnology. Open-access curriculum author.',
      institution: 'Cambridge University',
      department: 'Genetics Institute',
      verifiedEducator: true,
      subjects: ['Biology', 'Chemistry'],
      followersCount: 9400,
      followingCount: 240,
      postsCount: 92,
      savedCount: 41,
      rating: 4.92,
      createdAt: '2025-02-01T08:00:00.000Z',
    };

    const alex: User = {
      id: 'u_alex',
      username: 'alexchen',
      name: 'Alex Chen',
      email: 'alex.chen@student.berkeley.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Undergraduate student in Applied Mathematics & Machine Learning. Building open-source study guides and interactive math visualizers.',
      institution: 'UC Berkeley',
      gradeLevel: 'Junior / 3rd Year',
      verifiedEducator: false,
      subjects: ['Mathematics', 'Computer Science', 'Artificial Intelligence'],
      followersCount: 1840,
      followingCount: 420,
      postsCount: 46,
      savedCount: 128,
      createdAt: '2025-02-14T14:30:00.000Z',
    };

    const sophia: User = {
      id: 'u_sophia',
      username: 'sophiadata',
      name: 'Sophia Al-Mansoor',
      email: 'sophia@oxford.edu',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      bio: 'Economics & Behavioral Science scholar. Passionate about game theory, microeconomic models, and data-driven policy.',
      institution: 'University of Oxford',
      gradeLevel: 'Master candidate',
      verifiedEducator: false,
      subjects: ['Economics', 'Mathematics'],
      followersCount: 1250,
      followingCount: 310,
      postsCount: 38,
      savedCount: 94,
      createdAt: '2025-03-01T09:00:00.000Z',
    };

    [elena, marcus, maya, alex, sophia].forEach((u) => this.users.set(u.id, u));

    // Follow relationships
    this.follows.set(alex.id, new Set([elena.id, marcus.id, maya.id]));
    this.follows.set(elena.id, new Set([marcus.id]));
    this.follows.set(marcus.id, new Set([elena.id, alex.id]));

    // 2. Initial PDF Materials
    const pdfPhysics: PDFMaterial = {
      id: 'pdf_quantum_cheat',
      title: 'Comprehensive Quantum Mechanics & Wavepacket Derivations',
      description: 'Master formula sheet covering Schrödinger time-independent equations, Hermitian operators, Dirac bra-ket notation, and harmonic oscillators.',
      category: 'Physics',
      pageCount: 18,
      fileSize: '4.2 MB',
      downloadUrl: '#download-quantum-pdf',
      previewPages: [
        'Page 1: Fundamental Postulates of Quantum Mechanics & Hilbert Space',
        'Page 2: Time-Dependent vs Independent Schrödinger Formulation',
        'Page 3: Particle in a 1D Box & Quantum Well Wavefunctions',
        'Page 4: Angular Momentum Commutation Relations & Pauli Spin Matrices',
      ],
      authorId: elena.id,
      authorName: elena.name,
      downloadsCount: 1840,
      createdAt: '2026-03-10T14:00:00.000Z',
    };

    const pdfAlgorithms: PDFMaterial = {
      id: 'pdf_dsa_handbook',
      title: 'Data Structures & Algorithms: The Visual Interview Handbook',
      description: 'Complete 40-page illustrated handbook breaking down asymptotic Big-O bounds, graph traversals, dynamic programming tabulation, and Trie architectures.',
      category: 'Computer Science',
      pageCount: 40,
      fileSize: '9.8 MB',
      downloadUrl: '#download-dsa-pdf',
      previewPages: [
        'Chapter 1: Asymptotic Analysis & Master Theorem Cheat Sheet',
        'Chapter 2: Trees & Balanced Self-Balancing AVL vs Red-Black Trees',
        'Chapter 3: Graph Shortest Path: Dijkstra, Bellman-Ford, A*',
        'Chapter 4: 0/1 Knapsack & Longest Common Subsequence DP Grids',
      ],
      authorId: marcus.id,
      authorName: marcus.name,
      downloadsCount: 3410,
      createdAt: '2026-03-12T16:20:00.000Z',
    };

    this.materials.set(pdfPhysics.id, pdfPhysics);
    this.materials.set(pdfAlgorithms.id, pdfAlgorithms);

    // 3. Initial Quizzes
    const quizAI: Quiz = {
      id: 'quiz_neural_nets',
      title: 'Neural Networks & Gradient Descent Challenge',
      description: 'Test your grasp of activation functions, backpropagation calculus, regularization techniques, and transformer attention mechanisms.',
      category: 'Artificial Intelligence',
      authorId: marcus.id,
      authorName: marcus.name,
      authorAvatar: marcus.avatar,
      submissionsCount: 890,
      avgScore: 82,
      createdAt: '2026-03-15T11:00:00.000Z',
      questions: [
        {
          id: 'q1',
          question: 'Why is the vanishing gradient problem particularly prevalent when using the Sigmoid activation function in deep networks?',
          options: [
            'Because the sigmoid function has an infinite upper bound.',
            'Because the maximum derivative of the standard sigmoid is 0.25, shrinking gradients during chain-rule backpropagation.',
            'Because sigmoid outputs are non-monotonic.',
            'Because it cannot handle floating-point values less than zero.',
          ],
          correctAnswer: 1,
          explanation: 'The maximum derivative of σ(x) is 0.25 at x=0. When chained across many layers (0.25 × 0.25 × 0.25...), the gradient exponentially decays toward zero.',
        },
        {
          id: 'q2',
          question: 'What is the primary computational advantage of Self-Attention over traditional Recurrent Neural Networks (RNNs)?',
          options: [
            'It eliminates all matrix multiplications.',
            'It enables full parallelization across sequence tokens rather than sequential step-by-step dependency.',
            'It requires zero hyperparameter tuning.',
            'It uses integer weights instead of 32-bit floats.',
          ],
          correctAnswer: 1,
          explanation: 'Self-attention processes all tokens simultaneously via query, key, and value matrices Q·K^T, allowing GPU parallel training without sequential unrolling.',
        },
        {
          id: 'q3',
          question: 'In L2 Regularization (Ridge / Weight Decay), what penalty is added to the objective loss function?',
          options: [
            'The sum of absolute weights: λ Σ |w_i|',
            'The squared Euclidean norm of the weights: (λ/2) Σ w_i²',
            'The reciprocal of the learning rate.',
            'The determinant of the covariance matrix.',
          ],
          correctAnswer: 1,
          explanation: 'L2 regularization adds (λ/2) Σ w_i² to penalize extreme outlier weight magnitudes, encouraging smoother and more distributed representations.',
        },
        {
          id: 'q4',
          question: 'Which optimizer dynamically scales learning rates for each parameter using exponentially decaying averages of squared past gradients and first moments?',
          options: ['Stochastic Gradient Descent (SGD)', 'Batch Gradient Descent', 'Adam (Adaptive Moment Estimation)', 'Adagrad without decay'],
          correctAnswer: 2,
          explanation: 'Adam computes adaptive learning rates using both the first moment (mean of gradients) and second moment (uncentered variance of squared gradients).',
        },
      ],
    };

    this.quizzes.set(quizAI.id, quizAI);

    // 4. Initial Feed Posts
    const post1: Post = {
      id: 'post_quantum_orbitals',
      author: {
        id: elena.id,
        name: elena.name,
        username: elena.username,
        avatar: elena.avatar,
        role: elena.role,
        institution: elena.institution,
        verifiedEducator: elena.verifiedEducator,
      },
      type: 'image',
      category: 'Physics',
      title: 'Visualizing Quantum Probability Fields & The 3D Orbital Node Structure',
      content: `A common misconception among first-year quantum physics students is picturing electrons like miniature planets orbiting a sun. 

In reality, an electron doesn't exist at a single coordinate until an observation collapses the wavefunction. Instead, what we model with the Schrödinger equation $\\psi(r, \\theta, \\phi)$ is a continuous probability density field $|\\psi|^2$.

Notice the nodal planes in the 3d and 2p subshells in the diagram below: the probability of finding the electron exactly at the nodal surface is strictly zero, yet it traverses both lobes through quantum tunneling. 

What questions do you have on quantum superposition and wavepacket spread? Drop your thoughts below! ⚛️🔬`,
      mediaUrl: '/src/assets/images/hero_quantum_physics_1793940252300.jpg',
      mediaAspectRatio: '16:9',
      pdfMaterial: pdfPhysics,
      hashtags: ['QuantumPhysics', 'STEM', 'Wavefunction', 'PhysicsEducation', 'OpenScience'],
      likesCount: 1420,
      commentsCount: 86,
      repostsCount: 312,
      bookmarksCount: 654,
      createdAt: '2026-03-20T14:15:00.000Z',
      readTime: '3 min read',
    };

    const post2: Post = {
      id: 'post_crispr_editing',
      author: {
        id: maya.id,
        name: maya.name,
        username: maya.username,
        avatar: maya.avatar,
        role: maya.role,
        institution: maya.institution,
        verifiedEducator: maya.verifiedEducator,
      },
      type: 'image',
      category: 'Biology',
      title: 'CRISPR-Cas9 Molecular Machinery: The Precise Grammar of Genetic Editing',
      content: `How does Cas9 locate a single 20-base-pair target sequence inside 3.2 billion base pairs of the human genome in milliseconds?

It relies on a two-step kinetic verification process:
1. First, Cas9 scans rapidly along DNA looking for the 3-nucleotide **PAM site** (typically 5'-NGG-3' for SpCas9).
2. Only after PAM docking does it unzip the double helix and test for complementary base pairing against its single-guide RNA (sgRNA).

If there's a match, the RuvC and HNH endonuclease domains execute dual-strand cleavage, prompting the cell's endogenous repair pathways (NHEJ or Homology-Directed Repair). Check out the molecular architecture diagram attached! 🧬✨`,
      mediaUrl: '/src/assets/images/biology_dna_crispr_1793940256050.jpg',
      mediaAspectRatio: '4:3',
      hashtags: ['Biology', 'CRISPR', 'Genetics', 'Biotech', 'CellularMechanisms'],
      likesCount: 980,
      commentsCount: 42,
      repostsCount: 184,
      bookmarksCount: 420,
      createdAt: '2026-03-21T09:30:00.000Z',
      readTime: '4 min read',
    };

    const post3: Post = {
      id: 'post_golden_spiral',
      author: {
        id: alex.id,
        name: alex.name,
        username: alex.username,
        avatar: alex.avatar,
        role: alex.role,
        institution: alex.institution,
        verifiedEducator: alex.verifiedEducator,
      },
      type: 'image',
      category: 'Mathematics',
      title: 'The Golden Ratio (Φ ≈ 1.618) & Logarithmic Spirals in Nature and Topology',
      content: `Why do sunflower seed distributions, spiral galaxies, and nautilus shell chambers so frequently reflect the Golden Ratio?

It is the mathematical solution to the optimal packing problem in polar coordinates. If seeds grew with a rational fractional turn (e.g. 1/4 or 3/7), they would form straight spoke lines leaving vacant gaps. 

Because $\\Phi = \\frac{1 + \\sqrt{5}}{2}$ is the "most irrational number" (its continued fraction is $1 + 1/(1 + 1/(1 + ...))$ with the slowest convergence), it guarantees maximum packing density without alignment clumping!

Sharing this visual study sheet I plotted for our Calculus & Geometry seminar.`,
      mediaUrl: '/src/assets/images/math_golden_spiral_1793940254541.jpg',
      mediaAspectRatio: '4:3',
      hashtags: ['Mathematics', 'GoldenRatio', 'Calculus', 'SacredGeometry', 'StudentResearch'],
      likesCount: 840,
      commentsCount: 39,
      repostsCount: 145,
      bookmarksCount: 512,
      createdAt: '2026-03-22T10:15:00.000Z',
      readTime: '2 min read',
    };

    const post4: Post = {
      id: 'post_ai_quiz',
      author: {
        id: marcus.id,
        name: marcus.name,
        username: marcus.username,
        avatar: marcus.avatar,
        role: marcus.role,
        institution: marcus.institution,
        verifiedEducator: marcus.verifiedEducator,
      },
      type: 'quiz',
      category: 'Artificial Intelligence',
      title: 'Deep Learning & Attention Mechanisms Assessment (4 Interactive Questions)',
      content: `Ready to test your intuition on Backpropagation, Vanishing Gradients, and Transformer Self-Attention? 

I designed this 4-question interactive diagnostic quiz for our AI community. It gives you instant feedback with mathematical explanations for every option. Tap below to take the quiz right in your feed! 🧠⚡`,
      quiz: quizAI,
      pdfMaterial: pdfAlgorithms,
      hashtags: ['ArtificialIntelligence', 'MachineLearning', 'DeepLearning', 'Quiz', 'EdTech'],
      likesCount: 1650,
      commentsCount: 94,
      repostsCount: 420,
      bookmarksCount: 910,
      createdAt: '2026-03-23T15:00:00.000Z',
      readTime: '5 min quiz',
    };

    const post5: Post = {
      id: 'post_programming_flow',
      author: {
        id: marcus.id,
        name: marcus.name,
        username: marcus.username,
        avatar: marcus.avatar,
        role: marcus.role,
        institution: marcus.institution,
        verifiedEducator: marcus.verifiedEducator,
      },
      type: 'flow',
      category: 'Programming',
      title: 'Python Memory Secrets: Stack vs Heap & Reference Counting Explained in 60s',
      content: `Ever wondered why mutable default arguments in Python create silent bugs? 

In Python, functions are first-class objects created once at definition time. If you write:
\`\`\`python
def append_item(val, target_list=[]):
    target_list.append(val)
    return target_list
\`\`\`
That \`target_list\` is allocated once in heap memory and mutated across invocations! Always use \`target_list=None\` and initialize inside the function body. 💡`,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      hashtags: ['Programming', 'Python', 'CleanCode', 'SoftwareEngineering', 'Flows'],
      likesCount: 2100,
      commentsCount: 112,
      repostsCount: 680,
      bookmarksCount: 1400,
      createdAt: '2026-03-24T18:00:00.000Z',
      readTime: '1 min video',
    };

    [post1, post2, post3, post4, post5].forEach((p) => this.posts.set(p.id, p));

    // Seed post likes
    this.likes.set(post1.id, new Set([alex.id, marcus.id, sophia.id]));
    this.likes.set(post4.id, new Set([alex.id, elena.id]));

    // Seed post comments
    this.comments.set(post1.id, [
      {
        id: 'c1',
        postId: post1.id,
        author: {
          id: alex.id,
          name: alex.name,
          username: alex.username,
          avatar: alex.avatar,
          role: alex.role,
        },
        content: 'This visualization cleared up why the 3d orbital has complex angular nodes! Professor Vance, how does this align with electron-electron repulsion in multi-electron atoms like Iron?',
        createdAt: '2026-03-20T15:20:00.000Z',
        likesCount: 34,
      },
      {
        id: 'c2',
        postId: post1.id,
        author: {
          id: elena.id,
          name: elena.name,
          username: elena.username,
          avatar: elena.avatar,
          role: elena.role,
          verifiedEducator: true,
        },
        content: '@alexchen Great question! In multi-electron systems, the effective nuclear charge Z_eff gets shielded by core electrons (Slater rules). The degeneracy of 3d versus 4s splits, which is why 4s fills before 3d in neutral ground states.',
        createdAt: '2026-03-20T15:45:00.000Z',
        likesCount: 52,
      },
    ]);

    this.comments.set(post4.id, [
      {
        id: 'c3',
        postId: post4.id,
        author: {
          id: sophia.id,
          name: sophia.name,
          username: sophia.username,
          avatar: sophia.avatar,
          role: sophia.role,
        },
        content: 'Scored 100% on the quiz! The explanation for question 2 on Self-Attention matrix parallelization versus RNN unrolling was crystal clear.',
        createdAt: '2026-03-23T16:10:00.000Z',
        likesCount: 19,
      },
    ]);

    // 5. Initial Communities
    const comm1: Community = {
      id: 'comm_physics',
      name: 'Quantum Physics & Modern Cosmology Lab',
      description: 'Peer-reviewed research discussions, problem sets, and interactive simulations in quantum mechanics, general relativity, and condensed matter.',
      category: 'Physics',
      coverImage: '/src/assets/images/hero_quantum_physics_1793940252300.jpg',
      avatar: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
      type: 'subject',
      membersCount: 18400,
      postsCount: 512,
      isJoined: true,
      moderators: [elena.id],
      rules: [
        'Formulas should be formatted clearly or referenced with source papers.',
        'Constructive debate only — attack the theorem, not the student.',
        'Cite open-access preprints when discussing non-textbook hypotheses.',
      ],
      announcement: 'Weekly Study Session: Harmonic Oscillators & Operator Methods this Thursday at 5 PM UTC!',
      createdAt: '2025-01-20T00:00:00.000Z',
    };

    const comm2: Community = {
      id: 'comm_ai_ml',
      name: 'Artificial Intelligence & Deep Learning Circle',
      description: 'Global community for neural architecture design, LLM research, PyTorch code sharing, and AI safety discussions.',
      category: 'Artificial Intelligence',
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      type: 'subject',
      membersCount: 34200,
      postsCount: 1420,
      isJoined: true,
      moderators: [marcus.id],
      rules: [
        'Share reproducible code snippets via GitHub or Gist.',
        'No spam or low-effort promotional links.',
        'Include benchmark specs when posting training metrics.',
      ],
      announcement: 'New challenge: Build a tiny Transformer from scratch with zero external libraries!',
      createdAt: '2025-01-18T00:00:00.000Z',
    };

    const comm3: Community = {
      id: 'comm_mit_open',
      name: 'MIT STEM Scholars & OpenCourseWare Network',
      description: 'Collaborative student and educator hub tackling MIT OCW problem sets across Calculus, Linear Algebra, and CS Theory.',
      category: 'Computer Science',
      coverImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=80',
      avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
      type: 'school',
      institution: 'MIT Open Learning',
      membersCount: 22100,
      postsCount: 890,
      isJoined: false,
      moderators: [marcus.id, alex.id],
      rules: [
        'Do not share direct exam answers before the official deadline.',
        'Encourage Socratic dialogue and step-by-step guidance.',
      ],
      createdAt: '2025-02-10T00:00:00.000Z',
    };

    const comm4: Community = {
      id: 'comm_biotech',
      name: 'Biotechnology & CRISPR Explorers',
      description: 'From molecular genetics to synthetic biology: discussing papers, lab protocols, and bio-computation.',
      category: 'Biology',
      coverImage: '/src/assets/images/biology_dna_crispr_1793940256050.jpg',
      avatar: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80',
      type: 'subject',
      membersCount: 12600,
      postsCount: 340,
      isJoined: false,
      moderators: [maya.id],
      rules: ['Biosafety Level 1+ discussion standards apply.'],
      createdAt: '2025-02-25T00:00:00.000Z',
    };

    [comm1, comm2, comm3, comm4].forEach((c) => this.communities.set(c.id, c));

    // 6. Initial Direct Messages & Conversations
    const conv1: Conversation = {
      id: 'conv_elena_alex',
      type: 'direct',
      participants: [elena, alex],
      unreadCount: 0,
      updatedAt: '2026-03-24T16:40:00.000Z',
    };

    const conv2: Conversation = {
      id: 'conv_marcus_alex',
      type: 'direct',
      participants: [marcus, alex],
      unreadCount: 1,
      updatedAt: '2026-03-25T11:20:00.000Z',
    };

    this.conversations.set(conv1.id, conv1);
    this.conversations.set(conv2.id, conv2);

    this.messages.set(conv1.id, [
      {
        id: 'm1',
        conversationId: conv1.id,
        senderId: alex.id,
        senderName: alex.name,
        senderAvatar: alex.avatar,
        recipientId: elena.id,
        content: 'Hi Dr. Vance! Thank you for the lecture notes on wavepacket dispersion today. I was curious if we can apply the WKB approximation to our assignment problem 4?',
        createdAt: '2026-03-24T16:30:00.000Z',
        read: true,
      },
      {
        id: 'm2',
        conversationId: conv1.id,
        senderId: elena.id,
        senderName: elena.name,
        senderAvatar: elena.avatar,
        recipientId: alex.id,
        content: 'Hello Alex! Absolutely. Because the potential varies slowly compared to the local de Broglie wavelength λ(x), the WKB semi-classical phase integral is valid there. Check equation 4.12 in the cheat sheet!',
        attachmentType: 'pdf',
        attachmentTitle: 'Quantum Derivations Cheat Sheet (Page 4)',
        createdAt: '2026-03-24T16:40:00.000Z',
        read: true,
      },
    ]);

    this.messages.set(conv2.id, [
      {
        id: 'm3',
        conversationId: conv2.id,
        senderId: marcus.id,
        senderName: marcus.name,
        senderAvatar: marcus.avatar,
        recipientId: alex.id,
        content: 'Hey Alex, great work on your mathematical visualization post! The community loved the Golden Ratio graph. Want to co-host a workshop on algorithmic simulations next Tuesday?',
        createdAt: '2026-03-25T11:20:00.000Z',
        read: false,
      },
    ]);

    // 7. Initial Notifications for current user (Alex Chen by default)
    this.notifications.set(alex.id, [
      {
        id: 'n1',
        userId: alex.id,
        sender: {
          id: elena.id,
          name: elena.name,
          avatar: elena.avatar,
          role: elena.role,
        },
        type: 'like',
        title: 'New Like',
        message: 'Dr. Elena Vance liked your post on Logarithmic Spirals in Nature.',
        targetId: post3.id,
        targetType: 'post',
        read: false,
        createdAt: '2026-03-22T10:45:00.000Z',
      },
      {
        id: 'n2',
        userId: alex.id,
        sender: {
          id: marcus.id,
          name: marcus.name,
          avatar: marcus.avatar,
          role: marcus.role,
        },
        type: 'message',
        title: 'New Message',
        message: 'Marcus Thorne sent you a direct message about the upcoming simulation workshop.',
        targetId: conv2.id,
        targetType: 'message',
        read: false,
        createdAt: '2026-03-25T11:20:00.000Z',
      },
      {
        id: 'n3',
        userId: alex.id,
        sender: {
          id: 'system_ai',
          name: 'NETFLOW AI',
          avatar: '/public/icon.svg',
          role: 'creator',
        },
        type: 'ai_recommendation',
        title: 'AI Learning Path Recommendation',
        message: 'Based on your recent interest in Quantum Physics and Calculus, try the "Harmonic Oscillators" study guide with step-by-step problem sets.',
        targetId: 'ai_path_calc',
        targetType: 'quiz',
        read: true,
        createdAt: '2026-03-23T08:00:00.000Z',
      },
    ]);
  }
}

export const db = new InMemoryDB();
