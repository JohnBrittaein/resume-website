// From the "RL: Training Ants to Move a Couch Around a Corner" card on the previous site (origin/main).
export default {
  title: 'RL: Training "Ants" to Move a Couch Around a Corner',
  category: "machine-learning",
  order: 11,
  summary: "Designed my own MDP environment and a Q-learning agent, then competed head-to-head against classmates' agents.",
  cover: "/images/projects/RLCouchMoving.gif",
  description:
    'Designed a custom reinforcement learning environment (a team of "ants" navigating a corridor and turning a corner while carrying a couch) along with a tabular Q-learning agent to solve it, for a class-wide competition scoring agents against every other student\'s environment.',
  role: "Sole developer: designed both the environment and the agent.",
  skills: ["Reinforcement learning", "Q-learning", "MDP design", "State discretization", "Epsilon-greedy exploration"],
  tools: ["Python", "NumPy"],
  images: [{ src: "/images/projects/RLCouchMoving.gif", alt: "Animation of the ants agent carrying a couch around a corner" }],
};
