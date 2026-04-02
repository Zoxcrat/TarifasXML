import { escapeXml } from '../utils/escapeXml.js';

/**
 * Hoja Info: metadatos fijos del template TMS (misma estructura que en Excel).
 */
export function infoWorksheetXml() {
  const rows = [
    ['Version', '2', 'num'],
    ['APIRequest', 'addTariffEntity', 'str'],
    ['Timestamp', 'MM/dd/yyyy HH:mm', 'str'],
    ['Date', 'MM/dd/yyyy', 'str'],
    ['Time', 'HH:mm', 'str'],
    ['', '', 'empty'],
    ["All cells should be formatted to 'text'", '', 'a'],
    ['', '', 'empty'],
    [
      'In order to delete information, do not delete cells, delete the entire row',
      '',
      'a',
    ],
  ];

  const rowXml = rows
    .map((r) => {
      const [a, b, mode] = r;
      if (mode === 'empty') {
        return '   <Row>\n    <Cell/>\n    <Cell/>\n    <Cell/>\n   </Row>';
      }
      if (mode === 'num') {
        return `   <Row>\n    <Cell><Data ss:Type="String">${escapeXml(a)}</Data></Cell>\n    <Cell><Data ss:Type="Number">${b}</Data></Cell>\n    <Cell/>\n   </Row>`;
      }
      if (mode === 'a') {
        return `   <Row>\n    <Cell><Data ss:Type="String">${escapeXml(a)}</Data></Cell>\n    <Cell/>\n    <Cell/>\n   </Row>`;
      }
      return `   <Row>\n    <Cell><Data ss:Type="String">${escapeXml(a)}</Data></Cell>\n    <Cell><Data ss:Type="String">${escapeXml(b)}</Data></Cell>\n    <Cell/>\n   </Row>`;
    })
    .join('\n');

  return ` <Worksheet ss:Name="Info">
  <Table ss:ExpandedColumnCount="3" ss:ExpandedRowCount="9" x:FullColumns="1" x:FullRows="1">
${rowXml}
  </Table>
 </Worksheet>`;
}

/**
 * Hoja Mapping: COLUMN/CONSTANT → columnas Data → API Field (Blue Yonder).
 */
export function mappingWorksheetXml() {
  const mappingRows = [
    ['Map Type', 'Map Value', 'API Field'],
    ['COLUMN', 'Type', '#RowType'],
    ['COLUMN', 'TariffID', 'TariffEntity.Rate.TariffID'],
    ['COLUMN', 'RateCode', 'TariffEntity.Rate.RateCode'],
    ['COLUMN', 'Service ID', 'TariffEntity.Rate.TariffServiceCode'],
    ['COLUMN', 'Charge ID', 'TariffEntity.Rate.TariffChargeCode'],
    ['CONSTANT', '*FAK', 'TariffEntity.Rate.FreightClassCode'],
    ['COLUMN', 'Equipment Type', 'TariffEntity.Rate.EquipmentTypeCode'],
    ['COLUMN', 'Base Charge', 'TariffEntity.Rate.BaseChargeAmount'],
    ['COLUMN', 'Minimum Charge', 'TariffEntity.Rate.MinimumChargeAmount'],
    ['COLUMN', 'Maximum Charge', 'TariffEntity.Rate.MaximumChargeAmount'],
    ['COLUMN', 'Effective Date', 'TariffEntity.Rate.EffectiveDate'],
    ['COLUMN', 'Expiration Date', 'TariffEntity.Rate.ExpirationDate'],
    ['COLUMN', 'Currency', 'TariffEntity.Rate.CurrencyCode'],
    ['COLUMN', 'RateRangeCode', 'TariffEntity.Rate.RateRange.RangeCode'],
    ['COLUMN', 'Range To', 'TariffEntity.Rate.RateRange.RangeToUnits'],
    ['COLUMN', 'Range Base Charge', 'TariffEntity.Rate.RateRange.BaseChargeAmount'],
    ['COLUMN', 'Rate per Unit', 'TariffEntity.Rate.RateRange.RatePerUnit'],
    ['CONSTANT', 'FALSE', 'TariffEntity.Rate.IgnoreRateRangesFlag'],
  ];

  const rowXml = mappingRows
    .map((cells) => {
      const [c0, c1, c2] = cells.map((x) => escapeXml(x));
      return `   <Row>\n    <Cell><Data ss:Type="String">${c0}</Data></Cell>\n    <Cell><Data ss:Type="String">${c1}</Data></Cell>\n    <Cell><Data ss:Type="String">${c2}</Data></Cell>\n   </Row>`;
    })
    .join('\n');

  return ` <Worksheet ss:Name="Mapping">
  <Table ss:ExpandedColumnCount="3" ss:ExpandedRowCount="19" x:FullColumns="1" x:FullRows="1">
${rowXml}
  </Table>
 </Worksheet>`;
}
