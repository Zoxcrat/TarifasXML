import { escapeXml } from '../utils/escapeXml.js';

const COLS = 16;
const NS = 'urn:schemas-microsoft-com:office:spreadsheet';

/**
 * @param {import('./tariffProcessor.js').buildTariffPayload} payload
 */
export function buildSpreadsheetXml(payload) {
  const dataRows = [];

  dataRows.push(headerRowXml());

  for (const block of payload.blocks) {
    const { bands, equipmentType, rateCode, chargeId } = block;
    if (bands.length === 0) continue;

    const [first, ...rest] = bands;

    dataRows.push(
      headerLineXml(
        payload,
        equipmentType,
        rateCode,
        chargeId,
        first.rangeTo,
        first.ratePerUnit
      )
    );

    for (const band of rest) {
      dataRows.push(detailLineXml(band.rangeTo, band.ratePerUnit));
    }
  }

  const rowCount = dataRows.length;
  const table = `
  <Table ss:ExpandedColumnCount="${COLS}" ss:ExpandedRowCount="${rowCount}" x:FullColumns="1" x:FullRows="1">
${dataRows.join('\n')}
  </Table>`;

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="${NS}"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Data">
${table}
 </Worksheet>
</Workbook>`;
}

function headerRowXml() {
  const headers = [
    'Type',
    'TariffID',
    'Service ID',
    'RateCode',
    'Charge ID',
    'Equipment Type',
    'Base Charge',
    'Minimum Charge',
    'Maximum Charge',
    'Currency',
    'Effective Date',
    'Expiration Date',
    'RateRangeCode',
    'Range To',
    'Rate per Unit',
    'Range Base Charge',
  ];
  const cells = headers.map(
    (h) => `    <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
  );
  return `   <Row>\n${cells.join('\n')}\n   </Row>`;
}

function headerLineXml(
  payload,
  equipmentType,
  rateCode,
  chargeId,
  rangeTo,
  ratePerUnit
) {
  const cells = [
    stringCell('H'),
    stringCell(payload.tariffId),
    stringCell(payload.serviceId),
    stringCell(rateCode),
    stringCell(chargeId),
    stringCell(equipmentType),
    stringCell(payload.baseCharge),
    stringCell(payload.minimumCharge),
    stringCell(payload.maximumCharge),
    stringCell(payload.currency),
    stringCell(payload.effectiveDate),
    stringCell(payload.expirationDate),
    stringCell(payload.rateRangeCode),
    numberCell(rangeTo),
    numberCell(ratePerUnit),
    stringCell(payload.rangeBaseCharge),
  ];
  return `   <Row>\n${cells.join('\n')}\n   </Row>`;
}

function detailLineXml(rangeTo, ratePerUnit) {
  return `   <Row>
    <Cell><Data ss:Type="String">D</Data></Cell>
    <Cell></Cell>
    <Cell ss:Index="13"></Cell>
    <Cell><Data ss:Type="Number">${rangeTo}</Data></Cell>
    <Cell><Data ss:Type="Number">${ratePerUnit}</Data></Cell>
    <Cell><Data ss:Type="String">0</Data></Cell>
   </Row>`;
}

function stringCell(value) {
  return `    <Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function numberCell(value) {
  return `    <Cell><Data ss:Type="Number">${value}</Data></Cell>`;
}
