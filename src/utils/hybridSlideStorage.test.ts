import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDefaultHighResSlideDeck,
  buildDefaultAnimatedHtmlSimulation,
  getDefaultWarmupMediaConfig,
  buildDefaultWarmupSvgDataUrl,
} from './hybridSlideStorage';
import { getPeriodsForGrade } from '../data/mockCurriculumData';

test('buildDefaultHighResSlideDeck generates 5 high-resolution SVG slide pages with warmupConfig for any period', () => {
  const k6Periods = getPeriodsForGrade(6);
  const spec = k6Periods[0]; // Khối 6 Tiết 1

  const deck = buildDefaultHighResSlideDeck({
    grade: spec.grade,
    period: spec.period,
    lessonTitle: spec.lessonTitle,
    topic: spec.topic,
    yccd: spec.yccd,
    nlsCode: spec.digitalCompetency,
  });
  assert.equal(deck.lessonKey, 'k6-tiet-1');
  assert.equal(deck.grade, 6);
  assert.equal(deck.period, 1);
  assert.equal(deck.totalPages, 5);
  assert.equal(deck.slides.length, 5);
  assert.equal(deck.renderQuality, 'default-vector-svg');

  for (const page of deck.slides) {
    assert.ok(page.imageUrl.startsWith('data:image/svg+xml;'));
    assert.equal(page.width, 1920);
    assert.equal(page.height, 1080);
  }

  assert.ok(deck.warmupConfig);
  assert.equal(deck.warmupConfig.activeMediaType, 'html-sim');
  assert.ok(deck.warmupConfig.videoUrl.startsWith('http'));
  assert.ok(deck.warmupConfig.imageUrl.startsWith('data:image/svg+xml;'));
  assert.ok(deck.warmupConfig.htmlSimulationCode.includes('<!DOCTYPE html>'));
  assert.ok(deck.warmupConfig.htmlSimulationCode.includes('<canvas'));
});

test('buildDefaultAnimatedHtmlSimulation and getDefaultWarmupMediaConfig provide only Video, Image, and Embedded HTML Motion Simulation', () => {
  const k8Periods = getPeriodsForGrade(8);
  const spec = k8Periods[0];
  const params = {
    grade: spec.grade,
    period: spec.period,
    lessonTitle: spec.lessonTitle,
    topic: spec.topic,
    yccd: spec.yccd,
  };

  const htmlSim = buildDefaultAnimatedHtmlSimulation(params);
  assert.ok(htmlSim.includes('requestAnimationFrame'));
  assert.ok(htmlSim.includes('<canvas'));

  const svgImg = buildDefaultWarmupSvgDataUrl(params);
  assert.ok(svgImg.startsWith('data:image/svg+xml;'));

  const warmupCfg = getDefaultWarmupMediaConfig(params);
  assert.equal(warmupCfg.activeMediaType, 'html-sim');
  assert.ok(warmupCfg.videoTitle.length > 0);
  assert.ok(warmupCfg.imageCaption.length > 0);
  assert.ok(warmupCfg.htmlSimulationTitle.length > 0);
});
