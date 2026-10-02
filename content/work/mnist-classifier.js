// From the "MNIST Digit Classifier Progression" card on the previous site (origin/main).
export default {
  title: "MNIST Digit Classifier Progression",
  category: "machine-learning",
  order: 10,
  summary: "Baseline neural net and SVM, then a CNN, then a custom ResNet hitting 99.3% test accuracy.",
  cover: "/images/projects/MNISTDigitGrid.png",
  description:
    "Built and compared four MNIST digit classifiers, iterating from a baseline neural network and SVM (~94%) up through a CNN (98.95%) to a custom ResNet architecture reaching 99.31% test accuracy.",
  role: "Sole developer: built, trained, and evaluated all four models.",
  skills: ["Machine learning", "Convolutional neural networks", "ResNet architectures", "Model evaluation"],
  tools: ["Python", "PyTorch", "scikit-learn"],
  images: [{ src: "/images/projects/MNISTDigitGrid.png", alt: "Sample MNIST digits used to train and test the classifiers" }],
};
