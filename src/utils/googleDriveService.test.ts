import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultTeacherDriveFolderUrl,
  formatFileSize,
  detectSubmissionFileType,
} from './googleDriveService';

test('getDefaultTeacherDriveFolderUrl generates clean URL for teacher Google Drive folder', () => {
  const url6 = getDefaultTeacherDriveFolderUrl(6, '6A10');
  assert.equal(url6, 'https://drive.google.com/drive/folders/thaytruongit_tinhoc_k6_6a10');

  const url8 = getDefaultTeacherDriveFolderUrl(8, '8A11');
  assert.equal(url8, 'https://drive.google.com/drive/folders/thaytruongit_tinhoc_k8_8a11');
});

test('formatFileSize formats byte sizes correctly into human readable strings', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1048576), '1 MB');
  assert.equal(formatFileSize(2621440), '2.5 MB');
});

test('detectSubmissionFileType classifies various student file extensions correctly', () => {
  const imgMeta = detectSubmissionFileType('screenshot_bai1.png');
  assert.equal(imgMeta.typeCategory, 'image');
  assert.equal(imgMeta.icon, 'image');

  const docMeta = detectSubmissionFileType('BaiTap_Tiet1.docx');
  assert.equal(docMeta.typeCategory, 'word');
  assert.equal(docMeta.icon, 'description');

  const excelMeta = detectSubmissionFileType('BangDiem_Tiet5.xlsx');
  assert.equal(excelMeta.typeCategory, 'excel');
  assert.equal(excelMeta.icon, 'table_view');

  const scratchMeta = detectSubmissionFileType('GameMeoDuoiChuot.sb3');
  assert.equal(scratchMeta.typeCategory, 'scratch');
  assert.equal(scratchMeta.icon, 'extension');

  const pdfMeta = detectSubmissionFileType('BaoCao.pdf');
  assert.equal(pdfMeta.typeCategory, 'pdf');
  assert.equal(pdfMeta.icon, 'picture_as_pdf');
});
