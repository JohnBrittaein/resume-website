// From the "FPGA Audio Looping Station" card on the previous site (origin/main).
export default {
  title: "FPGA Audio Looping Station",
  category: "audio-tech",
  alsoIn: ["music"],
  featured: true,
  order: 2,
  summary: "A hardware 4-track looper pedal, run by an FPGA, that I designed, 3D-printed, and soldered myself.",
  cover: "/images/projects/FPGALooperBlockDiagram.png",
  description:
    "A 4-channel audio looping station built on a Zynq 7000 FPGA, with a custom guitar pedal housing an ESP32-based footswitch controller for record/overdub/monitor control and synchronized or independent loop lengths per track.",
  role: "Team member (4-person team): contributed to VHDL design of the audio signal path and loop control finite state machines and UART integration with the pedal board, and designed, 3D-printed, and soldered the physical guitar pedal enclosure and footswitch hardware.",
  skills: ["VHDL", "FPGA development", "Digital audio signal processing", "Finite state machines", "I2S/UART protocols", "Enclosure design and fabrication", "Soldering"],
  tools: ["Xilinx Vivado", "Zynq 7000 FPGA", "ESP32", "Pmod I2S2", "3D printer", "Soldering iron"],
  images: [
    { src: "/images/projects/FPGALooperBlockDiagram.png", alt: "FPGA Audio Looping Station loop control block diagram", caption: "Loop control block diagram" },
    // Build photos (originals in images/photos/_Other/Pedal board (FPGA Looper project))
    { src: "photos/20260513_233106.jpg", alt: "The finished pedal: four footswitches with red and green status LEDs", caption: "The finished pedal" },
    { src: "photos/20260513_221747.jpg", alt: "The footswitch pedal on a lab bench beside a breadboard, an FPGA board, and a laptop", caption: "Test bench" },
    { src: "photos/20260513_221952.jpg", alt: "Zynq FPGA board with two audio I/O modules attached and a blue status LED lit", caption: "FPGA with audio I/O" },
    { src: "photos/20260513_221938.jpg", alt: "Hand holding the opened pedal enclosure, packed with colorful wiring and a controller board", caption: "Inside the enclosure" },
    { src: "photos/20260513_221941.jpg", alt: "Opened pedal enclosure showing the footswitch wiring inside", caption: "Footswitch wiring" },
    { src: "photos/20260513_233117.jpg", alt: "Pedal status LEDs lit in one combination while tracks record and loop", caption: "Status LEDs" },
    { src: "photos/20260513_233119.jpg", alt: "Pedal status LEDs lit in another combination", caption: "Status LEDs" },
    { src: "photos/20260513_233121.jpg", alt: "Pedal status LEDs lit in a third combination", caption: "Status LEDs" },
    { src: "photos/Screenshot_20260513_222603_Gallery.jpg", alt: "Top-down view of the pedal with its status LEDs lit, wired to a breadboard", caption: "Wired up" },
    { src: "photos/20260513_222011.jpg", alt: "Desktop speaker used as the audio output, its cable coiled at the base", caption: "Monitor speaker" },
  ],
  video: { youtube: "yahZ0dx0yA0", title: "FPGA Audio Looping Station demo" },
  documents: [{ label: "Full project report", file: "/documents/reports/FPGA_Looping_Station_Report.pdf" }],
};
