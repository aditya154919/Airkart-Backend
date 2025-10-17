const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const generateTicketPDF = async (ticket, user, passengers) => {
  const dirPath = path.join(__dirname, "../tickets");
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  const filePath = path.join(dirPath, `Ticket_${ticket._id}.pdf`);
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 20 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const blue = "#0A46FF";
  const purple = "#8A2BE2";

  // Sidebar
  doc.rect(20, 20, 100, 550).fill(blue);
  doc.fillColor("white").fontSize(20).text("✈️", 60, 40, { align: "center" });
  doc.fontSize(18).text(ticket.flight.airline, 35, 80, { align: "center" });
  doc.fontSize(12).text(ticket.flight.flightNumber, 40, 105, { align: "center" });

  // Header
  doc
    .fillColor("black")
    .fontSize(20)
    .text(`${ticket.flight.departureCity} → ${ticket.flight.arrivalCity}`, 140, 40, {
      align: "right",
    });
  doc
    .fontSize(12)
    .fillColor("gray")
    .text(
      `${new Date(ticket.flight.departureTime).toLocaleString()} - ${new Date(
        ticket.flight.arrivalTime
      ).toLocaleString()}`,
      140,
      70,
      { align: "right" }
    );
  doc.moveTo(140, 100).lineTo(800, 100).stroke();

  // Passenger
  const p = passengers[0];
  doc
    .fontSize(14)
    .fillColor("black")
    .text(`Name: ${p.firstName} ${p.lastName}`, 140, 120)
    .text(`Age: ${p.age}`, 140, 145)
    .text(`Gender: ${p.gender}`, 140, 170)
    .text(`Aadhar No: ${p.aadharNo}`, 140, 195);

  // Flight details
  doc
    .text(`Seat: ${ticket.flight.seat || "4B"}`, 450, 120)
    .text(`Gate: ${ticket.flight.gate || "G16"}`, 450, 145)
    .text(`Terminal: ${ticket.flight.terminal || "T1"}`, 450, 170)
    .text(`Class: ${ticket.flight.class || "Economy"}`, 450, 195);

  doc.moveTo(140, 220).lineTo(800, 220).stroke();

  // Payment info
  doc.fontSize(16).fillColor(purple).text(`Total Paid: ₹${ticket.totalAmount}`, 140, 240);

  // === BARCODE from frontend ===
  if (ticket.barcodeImage) {
    try {
      let barcodeImagePath;
      if (ticket.barcodeImage.startsWith("data:image")) {
        // base64 image
        const base64Data = ticket.barcodeImage.replace(/^data:image\/png;base64,/, "");
        barcodeImagePath = path.join(dirPath, `barcode_${ticket._id}.png`);
        fs.writeFileSync(barcodeImagePath, base64Data, "base64");
      } else {
        // URL image
        const response = await axios.get(ticket.barcodeImage, { responseType: "arraybuffer" });
        barcodeImagePath = path.join(dirPath, `barcode_${ticket._id}.png`);
        fs.writeFileSync(barcodeImagePath, response.data);
      }

      doc.image(barcodeImagePath, 140, 300, { width: 500, height: 100 });
    } catch (err) {
      console.error("Failed to load barcode image:", err.message);
    }
  }

  doc.fontSize(10).fillColor("gray").text("Thank you for flying with AirKart!", 0, 520, {
    align: "center",
  });

  doc.end();
  return filePath;
};

module.exports = generateTicketPDF;
