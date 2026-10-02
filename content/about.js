// About page content. Education, experience, skills, and writing were carried
// over word-for-word from the previous single-page résumé site.

export default {

  // Paragraphs support [links](https://…), **bold**, and *italics*.
  intro: [
    "Photographer, musician, and computer engineer in Des Moines, Iowa. Computer Engineering at Iowa State University, minor in Music Technology. Software and lab automation at Ames National Laboratory.",
  ],
  // One line for the homepage "About" block.
  short: "Photographer, musician, and computer engineer in Des Moines. Computer Engineering at Iowa State University; software and lab automation at Ames National Laboratory.",

  education: [
    {
      school: "Iowa State University",
      place: "Ames, IA",
      url: "https://www.iastate.edu/",
      degree: "Bachelor of Computer Engineering, minor in Music Technology",
      notes: ["GPA: 3.38 (current)"],
    },
    {
      school: "Des Moines Area Community College",
      place: "Ankeny, IA",
      url: "https://www.dmacc.edu/",
      degree: "Engineering (Pre-Engineering)",
      notes: ["Cumulative GPA: 3.02 (2022 Summer)"],
    },
  ],

  experience: [
    {
      org: "Ames National Laboratory",
      url: "https://www.ameslab.gov",
      roles: [
        { title: "SULI Intern (Science Undergraduate Laboratory Internship, U.S. DOE)", dates: "Summer 2026" },
        { title: "Software Developer / ALAB Assistant (Paid Contributor)", dates: "August 23, 2025 – present" },
        { title: "Software Developer / ALAB Assistant (Paid Internship)", dates: "March 10, 2025 – August 23, 2025" },
      ],
      points: [
        "As a SULI intern, co-led [Rxn Bench](/work/rxn-bench/): a DIY automated chemistry bench built on a repurposed 3D printer, with pipetting, pH sensing, SiLA2 device servers on a Raspberry Pi, and a desktop control app.",
        "Collaborated with a team to develop [RxnRover](https://rxnrover.github.io/), an open-source lab automation software platform.",
        "Updated the RxnRover website, including API documentation, tutorials, and a plugin catalog using Sphinx.",
        "Developed RxnRover plugins and device drivers to control and communicate with lab equipment using LabVIEW.",
        "Incorporated user feedback to enhance usability and implement new features.",
        "Managed 45+ GitHub repositories as a member of the RxnRover organization.",
        "Provided technical support to scientists in lab environments, resolving hardware and software issues.",
        "Responded quickly and effectively to fix bugs and minimize lab downtime.",
        "Contributed to multiple experiments in collaboration with Ames and Oak Ridge National Laboratories.",
      ],
    },
  ],

  // Skill groups from the previous site. Items with an href link to the work
  // that shows the skill (the old site's skill tags did the same).
  skills: [
    {
      label: "Languages",
      items: [
        { label: "Python", href: "/work/#machine-learning" },
        { label: "Java", href: "/work/you-can-run/" },
        { label: "C", href: "/work/clean-up-robot/" },
        "C++",
        { label: "JavaScript", href: "/work/this-website/" },
        { label: "HTML", href: "/work/this-website/" },
        { label: "CSS", href: "/work/this-website/" },
        { label: "VHDL", href: "/work/#digital-design" },
        { label: "Solidity", href: "/work/blockchain-flight-insurance/" },
      ],
    },
    {
      label: "Embedded, FPGA & Hardware",
      items: [
        { label: "Embedded Systems", href: "/work/clean-up-robot/" },
        { label: "FPGA Development", href: "/work/fpga-looper/" },
        { label: "Computer Architecture", href: "/work/mips-cpus/" },
        "Circuit Design",
        { label: "PCB & Enclosure Fabrication", href: "/work/multi-effects-looper/" },
        { label: "Robotics & Sensor Fusion", href: "/work/#robotics" },
        { label: "LabVIEW", href: "/work/rxn-rover/" },
        { label: "Quartus Prime", href: "/work/twelve-step-sequencer/" },
        { label: "Vivado", href: "/work/fpga-looper/" },
        { label: "Vitis", href: "/work/fpga-looper/" },
        "LTspice",
        { label: "Fusion 360", href: "/work/clean-up-robot/" },
      ],
    },
    {
      label: "Software, AI & Mobile",
      items: [
        { label: "Machine Learning", href: "/work/#machine-learning" },
        { label: "Reinforcement Learning", href: "/work/wackah-mole/" },
        { label: "Android Development", href: "/work/you-can-run/" },
        { label: "Augmented Reality", href: "/work/you-can-run/" },
        { label: "Blockchain & Smart Contracts", href: "/work/blockchain-flight-insurance/" },
      ],
    },
    {
      label: "Creative & Digital Media",
      items: [
        { label: "3D Modeling & Animation", href: "/art/3d-renders/" },
        { label: "Music Production", href: "/music/" },
        { label: "Blender", href: "/art/3d-renders/" },
        { label: "Cinema 4D", href: "/art/3d-renders/" },
        "Adobe Photoshop",
        { label: "Ableton Live", href: "/music/" },
        { label: "Pro Tools", href: "/music/" },
        { label: "Max", href: "/music/max-modular-sequencer/" },
      ],
    },
    {
      label: "Focus Areas",
      items: [
        { label: "Lab Automation", href: "/work/rxn-rover/" },
        { label: "Audio Hardware", href: "/work/fpga-looper/" },
        { label: "Physical Computing", href: "/work/clean-up-robot/" },
        { label: "Instrument Interfaces", href: "/music/max-modular-sequencer/" },
      ],
    },
  ],

  writing: [
    {
      title: "Distributed Coordination and Security in Autonomous Drone Swarms",
      summary: "A literature survey examining distributed coordination protocols and security vulnerabilities in autonomous drone swarm systems.",
      file: "/documents/writings/John_Brittain_CPRE_4500_term_paper.pdf",
      kind: "Research survey",
    },
    {
      title: "The Ethics of AI: A Case Study",
      summary: "An examination of ethical considerations and real-world implications surrounding artificial intelligence.",
      file: "/documents/writings/The Ethics Of AI - Case Study.pdf",
      kind: "Case study",
    },
    {
      title: "Cumulative Reflection from my Experience at Iowa State University",
      summary: "A personal narrative exploring cumulative academic and personal growth throughout the university experience.",
      file: "/documents/writings/A Reflective Journey_ Navigating Your Cumulative Experience at Iowa State University.pdf",
      kind: "Reflection",
    },
    {
      title: "Reflection on General Education at ISU",
      summary: "A written reflection on the value and experience of general education requirements at Iowa State University.",
      file: "/documents/writings/Reflection on General Education At ISU.pdf",
      kind: "Reflection",
    },
  ],
};
