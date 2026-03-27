import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageNumber,
  Header, Footer
} from 'docx';

const TEMPLATE_URL = '/templates/Timbrado.docx';

export async function generateWithTemplate(doc: Document, filename: string) {
  // Generate the docx from docx-js
  const generatedBlob = await Packer.toBlob(doc);
  const generatedZip = await JSZip.loadAsync(generatedBlob);

  // Load the template
  const templateResponse = await fetch(TEMPLATE_URL);
  const templateBlob = await templateResponse.blob();
  const templateZip = await JSZip.loadAsync(templateBlob);

  // Get document.xml from generated docx
  let documentXml = await generatedZip.file('word/document.xml')!.async('string');

  // Inject header/footer references into the section properties
  const headerRef = '<w:headerReference w:type="default" r:id="rIdHeader1"/>';
  const footerRef = '<w:footerReference w:type="default" r:id="rIdFooter1"/>';
  
  // Insert header/footer refs into sectPr
  documentXml = documentXml.replace(
    /<w:sectPr([^>]*)>/,
    `<w:sectPr$1>${headerRef}${footerRef}`
  );

  // Build the final docx from the template base
  const finalZip = new JSZip();

  // Copy everything from template
  const templateFiles = Object.keys(templateZip.files);
  for (const path of templateFiles) {
    const file = templateZip.files[path];
    if (file.dir) {
      finalZip.folder(path);
    } else {
      const content = await file.async('uint8array');
      finalZip.file(path, content);
    }
  }

  // Replace document.xml with generated content
  finalZip.file('word/document.xml', documentXml);

  // Copy any tables/images rels from generated docx into document.xml.rels
  // Merge rels: keep template rels (header, footer, styles, etc.) + add generated rels
  let generatedRels = await generatedZip.file('word/_rels/document.xml.rels')?.async('string') || '';
  let templateRels = await templateZip.file('word/_rels/document.xml.rels')!.async('string');

  // Extract relationship entries from generated rels
  const genRelMatches = generatedRels.match(/<Relationship[^/]*\/>/g) || [];
  
  // Add header/footer rels with our custom IDs
  const headerRel = '<Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>';
  const footerRel = '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>';
  
  // Use template rels as base but update header/footer IDs
  templateRels = templateRels.replace(
    /(<Relationship[^>]*Type=\"[^"]*\/header\"[^>]*\/>)/,
    headerRel
  );
  templateRels = templateRels.replace(
    /(<Relationship[^>]*Type=\"[^"]*\/footer\"[^>]*\/>)/,
    footerRel
  );

  finalZip.file('word/_rels/document.xml.rels', templateRels);

  // Update Content_Types to include any types from generated
  let genContentTypes = await generatedZip.file('[Content_Types].xml')?.async('string') || '';
  let templateContentTypes = await templateZip.file('[Content_Types].xml')!.async('string');
  
  // Ensure Override for document.xml exists
  if (!templateContentTypes.includes('document.xml')) {
    templateContentTypes = templateContentTypes.replace(
      '</Types>',
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'
    );
  }

  finalZip.file('[Content_Types].xml', templateContentTypes);

  // Generate final blob
  const finalBlob = await finalZip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  saveAs(finalBlob, filename);
}

// Shared table utilities
export const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
export const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

export function createCell(text: string, width: number): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: text || '', size: 18 })],
      }),
    ],
  });
}

export function createHeaderCell(text: string, width: number, columnSpan: number, bgColor: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    columnSpan,
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 18, color: "FFFFFF", font: "Arial" })],
      }),
    ],
  });
}

export function createVerticeTable(vertices: Array<{codigoEstacao: string; longitude: string; latitude: string; altitude: string; codigoVante: string; azimute: string; distancia: string}>, headerBg: string): Table {
  const verticeRows = vertices.map((v) =>
    new TableRow({
      children: [
        createCell(v.codigoEstacao, 1400),
        createCell(v.longitude, 1400),
        createCell(v.latitude, 1400),
        createCell(v.altitude, 960),
        createCell(v.codigoVante, 1400),
        createCell(v.azimute, 1000),
        createCell(v.distancia, 1000),
      ],
    })
  );

  return new Table({
    width: { size: 9560, type: WidthType.DXA },
    columnWidths: [1400, 1400, 1400, 960, 1400, 1000, 1000],
    rows: [
      new TableRow({ children: [createHeaderCell("Sistema Geodésico de Referência (SGR): SIRGAS2000", 9560, 7, headerBg)] }),
      new TableRow({ children: [createHeaderCell("VÉRTICE ESTAÇÃO", 5160, 4, headerBg), createHeaderCell("VÉRTICE VANTE", 4400, 3, headerBg)] }),
      new TableRow({
        children: [
          createHeaderCell("Código (Vértice)", 1400, 1, headerBg),
          createHeaderCell("Longitude", 1400, 1, headerBg),
          createHeaderCell("Latitude", 1400, 1, headerBg),
          createHeaderCell("Altitude", 960, 1, headerBg),
          createHeaderCell("Código (Vértice)", 1400, 1, headerBg),
          createHeaderCell("Azimute SGL", 1000, 1, headerBg),
          createHeaderCell("Distância (m)", 1000, 1, headerBg),
        ],
      }),
      ...verticeRows,
    ],
  });
}
