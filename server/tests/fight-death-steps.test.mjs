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

test('a fighter killed during its own turn emits no steps after its death', () => {
  const current = fighter({
    hp: 10,
    maxHp: 1000,
    activeSkills: [{ name: 'fierceBrute', tier: 1, uses: [1, 1, 1] }],
  });
  const opponent = fighter({
    id: 'opponent',
    index: 1,
    team: 'R',
    hp: 10000,
    maxHp: 10000,
    // Always counter and one-shot the attacker
    counter: 100,
    baseDamage: 1000,
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

  const deathIndex = fightData.steps.findIndex(
    (step) => step.a === StepType.Death && step.f === current.index,
  );
  assert.notEqual(deathIndex, -1, 'the fighter should have died');

  const afterDeath = fightData.steps.slice(deathIndex + 1).filter(
    (step) => step.f === current.index || step.b === current.index,
  );

  assert.deepEqual(afterDeath, [], `steps after death: ${JSON.stringify(afterDeath)}`);
});
