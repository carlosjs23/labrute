import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StepType } from '@labrute/core';
import { FightModifier } from '@labrute/prisma';
import { playFighterTurn } from '../lib/utils/fight/fightMethods.js';

const fighter = (overrides = {}) => ({
  id: 'fighter',
  index: 0,
  team: 'L',
  name: 'fighter',
  type: 'brute',
  hp: 1000,
  maxHp: 1000,
  strength: 5,
  agility: 5,
  speed: 5,
  criticalChance: 0,
  criticalDamage: 1,
  regeneration: 0,
  initiative: 0,
  hitSpeed: 1,
  tempo: 1,
  baseDamage: 5,
  counter: 0,
  reversal: 0,
  combo: 0,
  deflect: 0,
  block: 0,
  accuracy: 1,
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

const runTurn = (fighterOverrides, opponentOverrides = {}) => {
  const current = fighter(fighterOverrides);
  const opponent = fighter({
    id: 'opponent',
    index: 1,
    team: 'R',
    ...opponentOverrides,
  });
  const fightData = {
    fighters: [current, opponent],
    initialFighters: [],
    modifiers: { [FightModifier.alwaysUseSupers]: true },
    steps: [],
    initiative: 0,
    winner: null,
    loser: null,
    overtime: false,
  };
  playFighterTurn(fightData, {
    fighter: { userId: null },
    opponent: { userId: null },
  }, {
    fighter: { achievements: {} },
    opponent: { achievements: {} },
  });
  return { current, fightData };
};

// Chef tier 1 poisons for 1.5% of max HP: 15 damage on a 1000 HP brute.
const chef = { chef: { name: 'chef', tier: 1, uses: [1, 1, 1] } };

test('survival is not consumed when the brute is left with exactly 1 HP', () => {
  const { current, fightData } = runTurn({
    hp: 16,
    maxHp: 1000,
    survival: true,
    poisonedBy: 1,
  }, {
    hp: 100000,
    maxHp: 100000,
    skills: chef,
  });

  assert.equal(current.hp, 1);
  assert.equal(current.survival, true, 'survival must remain available');
  assert.equal(
    fightData.steps.filter((s) => s.a === StepType.Survive).length,
    0,
    'no Survive step for a non-lethal blow',
  );
});

test('survival saves the brute from a lethal blow', () => {
  const { current, fightData } = runTurn({
    hp: 5,
    maxHp: 1000,
    survival: true,
    poisonedBy: 1,
  }, {
    hp: 100000,
    maxHp: 100000,
    skills: chef,
  });

  assert.equal(current.hp, 1);
  assert.equal(current.survival, false, 'survival is consumed by a lethal blow');
  assert.equal(
    fightData.steps.filter((s) => s.a === StepType.Survive).length,
    1,
  );
});
