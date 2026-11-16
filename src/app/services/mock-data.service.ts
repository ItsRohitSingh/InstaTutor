import { Injectable } from '@angular/core';
import { StudySession, ConceptNode, Flashcard, QuizQuestion, ChatMessage } from '../models/study-session.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  /**
   * Pre-packaged rich demo sessions that showcase all features out of the box.
   */
  getSampleSessions(): StudySession[] {
    return [
      this.getQuantumComputingSession(),
      this.getTransformerArchitectureSession(),
      this.getMacroeconomicsSession()
    ];
  }

  getQuantumComputingSession(): StudySession {
    return {
      id: 'session-quantum-computing',
      createdAt: Date.now() - 3600000 * 24 * 2, // 2 days ago
      title: 'Quantum Computing: Superposition & Entanglement',
      summary: 'An exploration of fundamental quantum mechanical phenomena harnessed for computational speedup, focusing on qubits, quantum state superposition, Bell states, and quantum gate operations.',
      mode: 'standard',
      sourceType: 'topic',
      sourceContent: 'Quantum Computing, Superposition, Entanglement, Qubits, and Quantum Gates',
      conceptMap: [
        {
          id: 'qc-core',
          label: 'Foundations of Quantum Information',
          description: 'Core physical principles differentiating classical bits from quantum information carriers.',
          status: 'mastered',
          children: [
            {
              id: 'qc-qubit',
              label: 'The Qubit (|0⟩, |1⟩)',
              description: 'The fundamental two-level quantum system represented as a linear combination of orthonormal basis states.',
              status: 'mastered',
              children: [
                {
                  id: 'qc-bloch',
                  label: 'Bloch Sphere Representation',
                  description: 'A geometrical representation of the pure state space of a two-level quantum system.',
                  status: 'exploring'
                }
              ]
            },
            {
              id: 'qc-superposition',
              label: 'Quantum Superposition',
              description: 'The ability of a quantum system to exist concurrently in multiple basis states until measurement occurs.',
              status: 'exploring'
            }
          ]
        },
        {
          id: 'qc-multi',
          label: 'Multi-Qubit Systems & Entanglement',
          description: 'Correlations between spatially separated quantum particles that defy classical explanation.',
          status: 'exploring',
          children: [
            {
              id: 'qc-entanglement',
              label: 'Quantum Entanglement & Bell States',
              description: 'Non-separable composite quantum states where measurement of one qubit instantly determines the state of another.',
              status: 'exploring'
            },
            {
              id: 'qc-teleportation',
              label: 'Quantum Teleportation Protocol',
              description: 'Transmission of arbitrary quantum information using shared entanglement and classical communication.',
              status: 'not_started'
            }
          ]
        },
        {
          id: 'qc-circuits',
          label: 'Quantum Gates & Algorithms',
          description: 'Unitary transformations applied to qubits to perform algorithmic computation.',
          status: 'not_started',
          children: [
            {
              id: 'qc-hadamard',
              label: 'Hadamard Gate (H)',
              description: 'Creates equal superpositions of |0⟩ and |1⟩ from standard computational basis states.',
              status: 'exploring'
            },
            {
              id: 'qc-cnot',
              label: 'Controlled-NOT (CNOT)',
              description: 'Two-qubit conditional gate that flips target qubit if and only if the control qubit is |1⟩.',
              status: 'not_started'
            },
            {
              id: 'qc-shor',
              label: "Shor's Algorithm & Quantum Speedup",
              description: 'Polynomial-time prime factorization threatening classical RSA cryptography.',
              status: 'not_started'
            }
          ]
        }
      ],
      flashcards: [
        {
          id: 'fc-qc-1',
          front: 'What mathematical construct describes the state of a single pure qubit?',
          back: 'A normalized vector |ψ⟩ = α|0⟩ + β|1⟩ in a 2-dimensional complex Hilbert space, where |α|² + |β|² = 1.',
          category: 'Foundations',
          difficulty: 'good',
          repetitions: 2,
          interval: 6,
          easeFactor: 2.5,
          nextReviewDate: Date.now() + 6 * 86400000
        },
        {
          id: 'fc-qc-2',
          front: 'What does the Born rule state regarding quantum measurement?',
          back: 'The probability P(i) of measuring basis state |i⟩ is given by the squared magnitude of its probability amplitude |⟨i|ψ⟩|².',
          category: 'Foundations',
          difficulty: 'easy',
          repetitions: 3,
          interval: 10,
          easeFactor: 2.65,
          nextReviewDate: Date.now() + 10 * 86400000
        },
        {
          id: 'fc-qc-3',
          front: 'How does the Hadamard gate transform the computational basis state |0⟩?',
          back: 'H|0⟩ = (|0⟩ + |1⟩) / √2, placing the qubit in an equal superposition state with 50% probability of measuring 0 or 1.',
          category: 'Gates',
          difficulty: 'good',
          repetitions: 1,
          interval: 1,
          easeFactor: 2.5,
          nextReviewDate: Date.now() + 86400000
        },
        {
          id: 'fc-qc-4',
          front: 'Why cannot quantum information be duplicated or copied arbitrarily?',
          back: 'The No-Cloning Theorem proves that an unknown quantum state cannot be cloned identically without destroying or collapsing the original state.',
          category: 'Theorems',
          difficulty: 'hard',
          repetitions: 0,
          interval: 1,
          easeFactor: 2.3,
          nextReviewDate: Date.now() - 3600000 // due now
        },
        {
          id: 'fc-qc-5',
          front: 'What defines an entangled two-qubit Bell state mathematically?',
          back: 'A composite state |Ψ⟩ that cannot be factored into a tensor product of two independent single-qubit states (|ψA⟩ ⊗ |ψB⟩).',
          category: 'Entanglement',
          difficulty: 'good',
          repetitions: 2,
          interval: 6,
          easeFactor: 2.5,
          nextReviewDate: Date.now() + 6 * 86400000
        }
      ],
      quizQuestions: [
        {
          id: 'qq-qc-1',
          question: 'If a qubit is in state |ψ⟩ = (1/2)|0⟩ + (√3/2)|1⟩, what is the probability of measuring |0⟩?',
          options: ['25% (1/4)', '50% (1/2)', '75% (3/4)', '100%'],
          correctIndex: 0,
          explanation: 'By the Born rule, the probability is |α|² = (1/2)² = 1/4 = 25%.',
          userSelectedIndex: 0
        },
        {
          id: 'qq-qc-2',
          question: 'Which quantum gate is essential for creating an entangled Bell state starting from |00⟩?',
          options: [
            'Pauli-X followed by Pauli-Z',
            'Hadamard on qubit 1 followed by CNOT with qubit 1 as control',
            'Phase gate (S) followed by Hadamard on both qubits',
            'Toffoli gate with both qubits as control'
          ],
          correctIndex: 1,
          explanation: 'H on qubit 1 creates (|0⟩ + |1⟩)/√2. The subsequent CNOT conditionally flips qubit 2, resulting in (|00⟩ + |11⟩)/√2, the canonical Bell state |Φ+⟩.',
          userSelectedIndex: 1
        },
        {
          id: 'qq-qc-3',
          question: 'Why does quantum entanglement not permit faster-than-light communication (superluminal signaling)?',
          options: [
            'Because qubits travel slower than light in physical cables',
            'Because individual measurement outcomes are purely random without classical correlation data',
            'Because the No-Cloning theorem forbids reading entangled qubits',
            'Because quantum decoherence destroys the channel within picoseconds'
          ],
          correctIndex: 1,
          explanation: 'While measurement collapses entangled states instantaneously across any distance, the local observer sees only random noise until classical communication reveals the partner measurement basis.',
          userSelectedIndex: undefined
        },
        {
          id: 'qq-qc-4',
          question: 'What is the dimension of the state vector space for a quantum system composed of n qubits?',
          options: ['2n', 'n²', '2ⁿ', 'n!'],
          correctIndex: 2,
          explanation: 'Each added qubit doubles the Hilbert space dimension via tensor products (2 × 2 × ... = 2ⁿ), which is the source of quantum computational parallelism.',
          userSelectedIndex: undefined
        }
      ],
      chatMessages: [
        {
          id: 'msg-qc-1',
          role: 'assistant',
          content: 'Welcome to your Socratic study session on Quantum Computing! Let us begin with the concept of Superposition. If a classical coin lands heads or tails, what fundamentally prevents a classical coin from being a model for a quantum qubit in superposition?',
          timestamp: Date.now() - 3500000
        },
        {
          id: 'msg-qc-2',
          role: 'user',
          content: 'A spinning coin seems like both heads and tails until you stop it with your hand.',
          timestamp: Date.now() - 3400000
        },
        {
          id: 'msg-qc-3',
          role: 'assistant',
          content: 'That is an insightful visual analogy! But consider: while the coin is spinning, does it have a deterministic orientation at any microsecond, or is it genuinely in an indeterminate linear combination that can interfere with itself like a wave?',
          timestamp: Date.now() - 3350000,
          isHint: true,
          relatedConceptId: 'qc-superposition'
        }
      ]
    };
  }

  getTransformerArchitectureSession(): StudySession {
    return {
      id: 'session-transformer-architecture',
      createdAt: Date.now() - 3600000 * 48,
      title: 'Transformer Architecture & Self-Attention',
      summary: 'Deep dive into the neural network architecture powering modern Large Language Models: Scaled Dot-Product Attention, Multi-Head Attention, Positional Encodings, and Feed-Forward Blocks.',
      mode: 'standard',
      sourceType: 'topic',
      sourceContent: 'Transformer Architecture, Multi-Head Attention, Self-Attention, Positional Encoding, Query Key Value vectors',
      conceptMap: [
        {
          id: 'tr-attention',
          label: 'Self-Attention Mechanism',
          description: 'Allows tokens to dynamically weigh the relevance of every other token in the sequence.',
          status: 'mastered',
          children: [
            {
              id: 'tr-qkv',
              label: 'Query, Key, and Value Projections (Q, K, V)',
              description: 'Linear projections transforming token embeddings into query retrieval vectors.',
              status: 'mastered'
            },
            {
              id: 'tr-scaled-dot',
              label: 'Scaled Dot-Product Formula',
              description: 'Attention(Q, K, V) = softmax(QK^T / √d_k)V prevents gradient vanishing in deep layers.',
              status: 'exploring'
            }
          ]
        },
        {
          id: 'tr-architecture',
          label: 'Layer Composition & Flow',
          description: 'Residual connections, Layer Normalization, and Feed-Forward subnetworks.',
          status: 'exploring',
          children: [
            {
              id: 'tr-mha',
              label: 'Multi-Head Attention (MHA)',
              description: 'Parallel attention heads attending to information from different representation subspaces.',
              status: 'exploring'
            },
            {
              id: 'tr-pe',
              label: 'Positional Encodings (Sinusoidal & RoPE)',
              description: 'Injects sequential position awareness into permutation-invariant attention matrices.',
              status: 'not_started'
            }
          ]
        }
      ],
      flashcards: [
        {
          id: 'fc-tr-1',
          front: 'Why is the dot-product scaled by 1/√d_k in Scaled Dot-Product Attention?',
          back: 'For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by √d_k counters this effect.',
          category: 'Attention',
          difficulty: 'good',
          repetitions: 1,
          interval: 1,
          easeFactor: 2.5,
          nextReviewDate: Date.now() + 86400000
        },
        {
          id: 'fc-tr-2',
          front: 'What is the role of Rotary Position Embedding (RoPE) compared to standard absolute positional embeddings?',
          back: 'RoPE encodes relative position by rotating Query and Key vectors in 2D coordinate planes, allowing natural extrapolation to long context sequences.',
          category: 'Positional',
          difficulty: 'hard',
          repetitions: 0,
          interval: 1,
          easeFactor: 2.3,
          nextReviewDate: Date.now() - 500000
        }
      ],
      quizQuestions: [
        {
          id: 'qq-tr-1',
          question: 'What is the computational complexity of standard full self-attention with respect to sequence length N?',
          options: ['O(N)', 'O(N log N)', 'O(N²)', 'O(N³)'],
          correctIndex: 2,
          explanation: 'Computing the pairwise dot-product between every query token and every key token requires an N × N matrix multiplication, giving O(N²) time and memory complexity.',
          userSelectedIndex: 2
        }
      ],
      chatMessages: [
        {
          id: 'msg-tr-1',
          role: 'assistant',
          content: 'Hello! Let us explore the Transformer. Why do you think self-attention replaced recurrent architectures like LSTMs for large-scale language modeling?',
          timestamp: Date.now() - 1000000
        }
      ]
    };
  }

  getMacroeconomicsSession(): StudySession {
    return {
      id: 'session-macroeconomics',
      createdAt: Date.now() - 3600000 * 72,
      title: 'Macroeconomics: Monetary Policy & Inflation',
      summary: 'Analysis of central banking interest rate setting, reserve requirements, open market operations, inflation targeting, and liquidity traps.',
      mode: 'standard',
      sourceType: 'topic',
      sourceContent: 'Macroeconomics, Monetary Policy, Central Banks, Interest Rates, Inflation',
      conceptMap: [
        {
          id: 'macro-cb',
          label: 'Central Bank Toolkit',
          description: 'Instruments used to regulate currency supply and credit conditions.',
          status: 'mastered',
          children: [
            {
              id: 'macro-rates',
              label: 'Benchmark Interest Rates',
              description: 'Discount and federal funds rates influencing short-term commercial lending.',
              status: 'mastered'
            },
            {
              id: 'macro-omo',
              label: 'Open Market Operations & QE',
              description: 'Buying and selling government securities to directly inject or withdraw liquidity.',
              status: 'exploring'
            }
          ]
        }
      ],
      flashcards: [
        {
          id: 'fc-macro-1',
          front: 'What is the Taylor Rule in monetary policy economics?',
          back: 'A prescriptive formula that links central bank policy interest rates to deviations of inflation from target and actual GDP from potential GDP.',
          category: 'Policy Rules',
          difficulty: 'good',
          repetitions: 2,
          interval: 6,
          easeFactor: 2.5,
          nextReviewDate: Date.now() + 6 * 86400000
        }
      ],
      quizQuestions: [
        {
          id: 'qq-macro-1',
          question: 'What phenomenon occurs when nominal interest rates reach zero and monetary policy loses traction?',
          options: ['Stagflation', 'Liquidity Trap', 'Hyperinflation', 'Dutch Disease'],
          correctIndex: 1,
          explanation: 'In a liquidity trap, injecting money fails to stimulate lending or investment because people hoard cash at near-zero yields.',
          userSelectedIndex: 1
        }
      ],
      chatMessages: [
        {
          id: 'msg-macro-1',
          role: 'assistant',
          content: 'Greetings. Suppose a nation is experiencing 9% headline inflation alongside 2% real GDP growth. How would a central bank weigh hiking interest rates against the risk of inducing unemployment?',
          timestamp: Date.now() - 800000
        }
      ]
    };
  }

  /**
   * Generates a realistic structured StudySession offline from arbitrary text or topic
   * when no API key is provided or offline demo mode is chosen.
   */
  generateProceduralSession(content: string, type: 'text' | 'topic', mode: 'standard' | 'quiz' | 'socratic'): StudySession {
    const title = type === 'topic' 
      ? content.trim() 
      : (content.split('\n')[0]?.substring(0, 50) || 'Study Session');
      
    const cleanTitle = title.charAt(0).toUpperCase() + title.slice(1);
    const id = 'session-' + Date.now();

    // Extract top concepts or keywords from content
    const words = content.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 4);
    const uniqueKeywords = Array.from(new Set(words.map(w => w.charAt(0).toUpperCase() + w.slice(1)))).slice(0, 6);
    const k1 = uniqueKeywords[0] || 'Core Principles';
    const k2 = uniqueKeywords[1] || 'Foundational Mechanisms';
    const k3 = uniqueKeywords[2] || 'Practical Applications';
    const k4 = uniqueKeywords[3] || 'Analytical Evaluation';

    const conceptMap: ConceptNode[] = [
      {
        id: `node-1-${Date.now()}`,
        label: `${cleanTitle} Overview`,
        description: `Primary conceptual umbrella and architectural foundation for ${cleanTitle}.`,
        status: 'exploring',
        children: [
          {
            id: `node-1-1-${Date.now()}`,
            label: `${k1} Dynamics`,
            description: `Key dynamics governing how ${k1.toLowerCase()} functions in this domain.`,
            status: 'mastered',
            children: [
              {
                id: `node-1-1-1-${Date.now()}`,
                label: `Primary Rules & Formulas`,
                description: `Underlying mathematical and logical formulations for ${cleanTitle}.`,
                status: 'exploring'
              }
            ]
          },
          {
            id: `node-1-2-${Date.now()}`,
            label: `${k2} Analysis`,
            description: `Interplay between internal mechanisms and observable systemic outcomes.`,
            status: 'not_started'
          }
        ]
      },
      {
        id: `node-2-${Date.now()}`,
        label: `${k3} & Implementations`,
        description: `Real-world methodologies, workflows, and experimental validations.`,
        status: 'not_started',
        children: [
          {
            id: `node-2-1-${Date.now()}`,
            label: `${k4} Strategies`,
            description: `Critical constraints, edge cases, and optimization benchmarks.`,
            status: 'not_started'
          }
        ]
      }
    ];

    const flashcards: Flashcard[] = [
      {
        id: `fc-1-${Date.now()}`,
        front: `What is the core objective and significance of ${cleanTitle}?`,
        back: `It provides a systematic methodology for understanding ${k1} and ${k2}, establishing the structural basis for high-fidelity reasoning in this field.`,
        category: 'Core Concepts',
        difficulty: 'good',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000
      },
      {
        id: `fc-2-${Date.now()}`,
        front: `How does ${k1} directly influence or constrain ${k2}?`,
        back: `Through direct parameter coupling, where alterations in ${k1} propagate boundary conditions that govern the behavior of ${k2}.`,
        category: 'Mechanisms',
        difficulty: 'hard',
        repetitions: 0,
        interval: 1,
        easeFactor: 2.3,
        nextReviewDate: Date.now()
      },
      {
        id: `fc-3-${Date.now()}`,
        front: `What primary assumption must hold true for ${cleanTitle} to remain valid?`,
        back: `The environmental conditions and input representations must remain stationary, preventing out-of-distribution drift in ${k3}.`,
        category: 'Assumptions',
        difficulty: 'easy',
        repetitions: 2,
        interval: 3,
        easeFactor: 2.65,
        nextReviewDate: Date.now() + 3 * 86400000
      },
      {
        id: `fc-4-${Date.now()}`,
        front: `What is the primary trade-off when optimizing for ${k4}?`,
        back: `Increased computational or cognitive overhead in exchange for higher deterministic precision and lower error variance.`,
        category: 'Trade-offs',
        difficulty: 'good',
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 86400000
      }
    ];

    const quizQuestions: QuizQuestion[] = [
      {
        id: `qq-1-${Date.now()}`,
        question: `Which statement best describes the fundamental principle of ${cleanTitle}?`,
        options: [
          `It operates under the assumption that ${k1} governs the primary operational characteristics.`,
          `It completely isolates ${k2} from all external feedback loops.`,
          `It is strictly limited to empirical observation with zero theoretical foundations.`,
          `It eliminates all requirement for validation benchmarks.`
        ],
        correctIndex: 0,
        explanation: `In standard literature, ${k1} acts as the primary governing parameter, while other factors operate as secondary constraints.`
      },
      {
        id: `qq-2-${Date.now()}`,
        question: `When dealing with ${k2}, what is the recommended protocol to mitigate edge-case anomalies?`,
        options: [
          `Ignore outliers and extrapolate from minimum variance points.`,
          `Apply systematic validation checks and calibrate the underlying ${k1} bounds.`,
          `Increase systemic noise to flatten gradient responses.`,
          `Abandon the model whenever uncertainty exceeds 5%.`
        ],
        correctIndex: 1,
        explanation: `Calibrating boundary conditions against robust validation checks ensures that system dynamics remain stable.`
      },
      {
        id: `qq-3-${Date.now()}`,
        question: `What distinguishes ${k3} from traditional baseline approaches in this domain?`,
        options: [
          `It guarantees zero computational complexity.`,
          `It provides enhanced representational capacity and explicit structural decomposition.`,
          `It requires manual configuration of all internal weights at runtime.`,
          `It cannot be applied to real-world scenarios.`
        ],
        correctIndex: 1,
        explanation: `Modern implementations provide superior representational richness and modular decomposition compared to older monolithic models.`
      }
    ];

    const chatMessages: ChatMessage[] = [
      {
        id: `msg-init-${Date.now()}`,
        role: 'assistant',
        content: `Greetings! I am your Socratic AI Tutor for "${cleanTitle}". Rather than simply giving you answers, I am here to challenge your assumptions and guide you to discover deep insights for yourself. To get started: In your own words, what do you think is the single most critical challenge in understanding ${k1}?`,
        timestamp: Date.now()
      }
    ];

    return {
      id,
      createdAt: Date.now(),
      title: cleanTitle,
      summary: `Micro-learning session generated for ${cleanTitle}. Explores foundational concepts (${k1}, ${k2}), core mechanisms, practical applications, and dynamic evaluation.`,
      conceptMap,
      flashcards,
      quizQuestions,
      chatMessages,
      mode,
      sourceType: type,
      sourceContent: content
    };
  }
}
