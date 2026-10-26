import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDamage } from '../lib/utils/fight/getDamage.js';

const baseFighter = (overrides = {}) => ({
  id: 'f',
  index: 0,
  team: 'L',
  name: 'f',
  type: 'brute',
  hp: 1000,
  maxHp: 1000,
  strength: 20,
  agility: 5,
  speed: 5,
  criticalChance: 0,
  criticalDamage: 1,
  regeneration: 0,
  initiative: 0,
  hitSpeed: 0,
  tempo: 1,
  baseDamage: 10,
  counter: 0,
  reversal: 0,
  combo: 0,
  deflect: 0,
  block: 0,
  accuracy: 0,
  armor: 0,
  disarm: 0,
  weaponGrip: 0,
  sabotage: 0,
  evasion: 0,
  reach: 0,
  size: 1,
  determination: 0,
  resistant: 0,
  ironHead: 0,
  retryAttack: false,
  bodybuilder: false,
  survival: false,
  balletShoes: false,
  fastMetabolism: null,
  skills: {},
  weapons: {},
  reloadableSkills: {},
  reloadableWeapons: {},
  canReload: false,
  shield: false,
  activeSkills: [],
  activeWeapon: null,
  keepWeaponChance: 0,
  poisonedBy: null,
  trapped: false,
  hitBy: {},
  ...overrides,
});

const withFixedRandom = (fn) => {
  const realRandom = Math.random;
  Math.random = () => 0.5;
  try {
    return fn();
  } finally {
    Math.random = realRandom;
  }
};

test('piledriver damage does not scale with the victim strength', () => {
  withFixedRandom(() => {
    const attacker = baseFighter({
      activeSkills: [{ name: 'hammer', tier: 1, uses: [1, 1, 1] }],
    });

    const weakVictim = baseFighter({ id: 'weak', index: 1, team: 'R', strength: 0 });
    const strongVictim = baseFighter({ id: 'strong', index: 2, team: 'R', strength: 200 });

    assert.equal(
      getDamage(false, attacker, weakVictim).damage,
      getDamage(false, attacker, strongVictim).damage,
    );
  });
});

test('piledriver damage scales with the attacker strength', () => {
  withFixedRandom(() => {
    const hammer = [{ name: 'hammer', tier: 1, uses: [1, 1, 1] }];
    const weakAttacker = baseFighter({ strength: 0, activeSkills: hammer });
    const strongAttacker = baseFighter({ strength: 200, activeSkills: hammer });
    const victim = baseFighter({ id: 'victim', index: 1, team: 'R', strength: 10 });

    const weakDamage = getDamage(false, weakAttacker, victim).damage;
    const strongDamage = getDamage(false, strongAttacker, victim).damage;

    assert.ok(strongDamage > weakDamage * 5, `${strongDamage} should be >> ${weakDamage}`);
  });
});
