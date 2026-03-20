import { AgeBand } from '../../../types';

/**
 * SVG path data for traceable characters.
 * All paths are normalized to a 200×200 viewBox.
 * Multi-stroke characters have multiple paths (child traces one at a time).
 *
 * Stroke order follows standard US handwriting curriculum (Zaner-Bloser style).
 */

export interface CharacterData {
  /** Unique key */
  id: string;
  /** Display label ("3", "A", "cat") */
  label: string;
  /** Spoken instruction */
  instruction: string;
  /** Spoken phonetic/educational hint */
  hint: string;
  /** SVG path strings — one per stroke, traced sequentially */
  strokes: string[];
  /** Category for variety */
  category: 'pre-writing' | 'digit' | 'uppercase' | 'lowercase';
}

// ── Pre-writing strokes (age 3-4) ──────────────────────────────

const PRE_WRITING: CharacterData[] = [
  {
    id: 'line_down',
    label: '│',
    instruction: 'Draw a line going down!',
    hint: 'Start at the top and go straight down!',
    strokes: ['M100,20 L100,180'],
    category: 'pre-writing',
  },
  {
    id: 'line_across',
    label: '─',
    instruction: 'Draw a line going across!',
    hint: 'Start on the left and go straight to the right!',
    strokes: ['M20,100 L180,100'],
    category: 'pre-writing',
  },
  {
    id: 'circle',
    label: '○',
    instruction: 'Draw a circle!',
    hint: 'Go around and around until you get back to the start!',
    strokes: [
      'M100,20 C155,20 180,70 180,100 C180,130 155,180 100,180 C45,180 20,130 20,100 C20,70 45,20 100,20',
    ],
    category: 'pre-writing',
  },
  {
    id: 'cross',
    label: '+',
    instruction: 'Draw a plus sign!',
    hint: 'First go down, then go across!',
    strokes: ['M100,30 L100,170', 'M30,100 L170,100'],
    category: 'pre-writing',
  },
  {
    id: 'diagonal_right',
    label: '╲',
    instruction: 'Draw a line going down this way!',
    hint: 'Start at the top left and go to the bottom right!',
    strokes: ['M30,30 L170,170'],
    category: 'pre-writing',
  },
  {
    id: 'diagonal_left',
    label: '╱',
    instruction: 'Draw a line going down the other way!',
    hint: 'Start at the top right and go to the bottom left!',
    strokes: ['M170,30 L30,170'],
    category: 'pre-writing',
  },
  {
    id: 'zigzag',
    label: '⚡',
    instruction: 'Draw a zigzag line!',
    hint: 'Go down, then across, then down again!',
    strokes: ['M30,30 L100,100 L30,170'],
    category: 'pre-writing',
  },
  {
    id: 'curve_right',
    label: ')',
    instruction: 'Draw a big curve!',
    hint: 'Start at the top and curve around to the bottom!',
    strokes: ['M60,30 C150,30 150,170 60,170'],
    category: 'pre-writing',
  },
  {
    id: 'wave',
    label: '〰',
    instruction: 'Draw a wavy line!',
    hint: 'Go up and down like a wave on the ocean!',
    strokes: ['M20,100 C60,40 80,40 100,100 C120,160 140,160 180,100'],
    category: 'pre-writing',
  },
  {
    id: 'square',
    label: '□',
    instruction: 'Draw a square!',
    hint: 'Four straight lines that make a box!',
    strokes: [
      'M40,40 L160,40',
      'M160,40 L160,160',
      'M160,160 L40,160',
      'M40,160 L40,40',
    ],
    category: 'pre-writing',
  },
];

// ── Digits (age 5-6 primarily) ──────────────────────────────────

const DIGITS: CharacterData[] = [
  {
    id: 'digit_0',
    label: '0',
    instruction: 'Trace the number zero!',
    hint: 'Zero looks like a big circle! O for zero!',
    strokes: [
      'M100,30 C150,30 170,70 170,100 C170,130 150,170 100,170 C50,170 30,130 30,100 C30,70 50,30 100,30',
    ],
    category: 'digit',
  },
  {
    id: 'digit_1',
    label: '1',
    instruction: 'Trace the number one!',
    hint: 'One is just a straight line going down!',
    strokes: ['M80,50 L100,30 L100,170', 'M70,170 L130,170'],
    category: 'digit',
  },
  {
    id: 'digit_2',
    label: '2',
    instruction: 'Trace the number two!',
    hint: 'Two curves at the top and then goes straight across!',
    strokes: [
      'M50,60 C50,30 90,20 110,30 C140,45 150,70 120,100 L40,170 L160,170',
    ],
    category: 'digit',
  },
  {
    id: 'digit_3',
    label: '3',
    instruction: 'Trace the number three!',
    hint: 'Three has two bumps on the right side!',
    strokes: [
      'M55,45 C70,25 130,25 140,55 C150,80 115,100 100,100 C115,100 155,120 140,150 C130,175 70,175 55,155',
    ],
    category: 'digit',
  },
  {
    id: 'digit_4',
    label: '4',
    instruction: 'Trace the number four!',
    hint: 'Four has a line down and a line across!',
    strokes: ['M120,30 L40,120 L160,120', 'M120,30 L120,170'],
    category: 'digit',
  },
  {
    id: 'digit_5',
    label: '5',
    instruction: 'Trace the number five!',
    hint: 'Five goes across, then down, then curves!',
    strokes: [
      'M140,30 L60,30 L50,95 C70,80 120,75 145,100 C170,130 140,175 90,170 C70,168 55,155 50,145',
    ],
    category: 'digit',
  },
  {
    id: 'digit_6',
    label: '6',
    instruction: 'Trace the number six!',
    hint: 'Six has a big curve and a circle at the bottom!',
    strokes: [
      'M130,40 C90,25 45,55 40,110 C35,145 55,175 100,175 C140,175 160,150 160,120 C160,90 135,75 100,80 C65,85 40,110 40,110',
    ],
    category: 'digit',
  },
  {
    id: 'digit_7',
    label: '7',
    instruction: 'Trace the number seven!',
    hint: 'Seven goes across at the top and then down!',
    strokes: ['M40,30 L160,30 L90,170'],
    category: 'digit',
  },
  {
    id: 'digit_8',
    label: '8',
    instruction: 'Trace the number eight!',
    hint: 'Eight is like two circles stacked up!',
    strokes: [
      'M100,30 C135,30 155,50 145,70 C138,85 115,95 100,100 C85,95 62,85 55,70 C45,50 65,30 100,30 M100,100 C65,105 40,125 45,150 C50,170 75,180 100,175 C125,180 150,170 155,150 C160,125 135,105 100,100',
    ],
    category: 'digit',
  },
  {
    id: 'digit_9',
    label: '9',
    instruction: 'Trace the number nine!',
    hint: 'Nine has a circle on top and a line going down!',
    strokes: [
      'M140,80 C140,50 120,30 95,30 C65,30 45,50 45,80 C45,110 70,125 100,120 C130,115 145,95 145,80 L130,170',
    ],
    category: 'digit',
  },
];

// ── Uppercase letters (age 5-6 and 7-8) ─────────────────────────

const UPPERCASE: CharacterData[] = [
  {
    id: 'upper_A',
    label: 'A',
    instruction: 'Trace the letter A!',
    hint: 'A goes up like a mountain and has a bridge in the middle!',
    strokes: ['M100,30 L30,170', 'M100,30 L170,170', 'M55,120 L145,120'],
    category: 'uppercase',
  },
  {
    id: 'upper_B',
    label: 'B',
    instruction: 'Trace the letter B!',
    hint: 'B has a big straight line and two bumps!',
    strokes: [
      'M50,30 L50,170',
      'M50,30 L110,30 C150,30 155,60 140,80 C130,90 110,95 50,100 L110,100 C155,100 160,130 145,155 C135,170 110,170 50,170',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_C',
    label: 'C',
    instruction: 'Trace the letter C!',
    hint: 'C is like a big curve that opens to the right!',
    strokes: [
      'M160,55 C140,30 115,20 90,25 C55,30 30,65 30,100 C30,135 55,170 90,175 C115,180 140,170 160,145',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_D',
    label: 'D',
    instruction: 'Trace the letter D!',
    hint: 'D has a straight line and a big curve!',
    strokes: [
      'M50,30 L50,170',
      'M50,30 L90,30 C145,30 175,65 175,100 C175,135 145,170 90,170 L50,170',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_E',
    label: 'E',
    instruction: 'Trace the letter E!',
    hint: 'E has one line down and three lines across!',
    strokes: ['M50,30 L50,170', 'M50,30 L150,30', 'M50,100 L130,100', 'M50,170 L150,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_F',
    label: 'F',
    instruction: 'Trace the letter F!',
    hint: 'F is like E but without the bottom line!',
    strokes: ['M50,30 L50,170', 'M50,30 L150,30', 'M50,100 L130,100'],
    category: 'uppercase',
  },
  {
    id: 'upper_H',
    label: 'H',
    instruction: 'Trace the letter H!',
    hint: 'H has two tall lines with a bridge in the middle!',
    strokes: ['M45,30 L45,170', 'M155,30 L155,170', 'M45,100 L155,100'],
    category: 'uppercase',
  },
  {
    id: 'upper_I',
    label: 'I',
    instruction: 'Trace the letter I!',
    hint: 'I is a straight line going down with a line on top and bottom!',
    strokes: ['M60,30 L140,30', 'M100,30 L100,170', 'M60,170 L140,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_L',
    label: 'L',
    instruction: 'Trace the letter L!',
    hint: 'L goes straight down and then across the bottom!',
    strokes: ['M55,30 L55,170', 'M55,170 L155,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_M',
    label: 'M',
    instruction: 'Trace the letter M!',
    hint: 'M goes up, down, up, down like mountains!',
    strokes: ['M30,170 L30,30 L100,110 L170,30 L170,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_O',
    label: 'O',
    instruction: 'Trace the letter O!',
    hint: 'O is a big round circle!',
    strokes: [
      'M100,25 C155,25 175,65 175,100 C175,140 155,175 100,175 C45,175 25,140 25,100 C25,65 45,25 100,25',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_S',
    label: 'S',
    instruction: 'Trace the letter S!',
    hint: 'S is like a snake that curves one way and then the other!',
    strokes: [
      'M145,50 C130,25 85,20 60,40 C35,60 50,85 80,95 L120,105 C150,115 165,140 140,165 C115,185 70,180 50,155',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_T',
    label: 'T',
    instruction: 'Trace the letter T!',
    hint: 'T has a line across the top and a line going down the middle!',
    strokes: ['M30,30 L170,30', 'M100,30 L100,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_X',
    label: 'X',
    instruction: 'Trace the letter X!',
    hint: 'X has two lines that cross in the middle!',
    strokes: ['M35,30 L165,170', 'M165,30 L35,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_Z',
    label: 'Z',
    instruction: 'Trace the letter Z!',
    hint: 'Z goes across, then diagonal, then across again!',
    strokes: ['M35,30 L165,30 L35,170 L165,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_G',
    label: 'G',
    instruction: 'Trace the letter G!',
    hint: 'G is like C with a little shelf!',
    strokes: [
      'M155,60 C140,30 110,20 85,25 C50,35 30,65 30,100 C30,140 55,175 90,175 C120,175 145,160 155,140 L155,100 L110,100',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_J',
    label: 'J',
    instruction: 'Trace the letter J!',
    hint: 'J goes down and hooks at the bottom!',
    strokes: ['M60,30 L140,30', 'M100,30 L100,140 C100,175 75,178 55,160'],
    category: 'uppercase',
  },
  {
    id: 'upper_K',
    label: 'K',
    instruction: 'Trace the letter K!',
    hint: 'K has a tall line and two arms!',
    strokes: ['M50,30 L50,170', 'M150,30 L50,100 L150,170'],
    category: 'uppercase',
  },
  {
    id: 'upper_N',
    label: 'N',
    instruction: 'Trace the letter N!',
    hint: 'N goes up, diagonal down, and back up!',
    strokes: ['M45,170 L45,30 L155,170 L155,30'],
    category: 'uppercase',
  },
  {
    id: 'upper_P',
    label: 'P',
    instruction: 'Trace the letter P!',
    hint: 'P has a tall line and a bump at the top!',
    strokes: [
      'M55,30 L55,170',
      'M55,30 L110,30 C150,30 158,60 140,80 C125,100 100,100 55,100',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_Q',
    label: 'Q',
    instruction: 'Trace the letter Q!',
    hint: 'Q is like O with a little tail!',
    strokes: [
      'M100,25 C155,25 175,65 175,100 C175,140 155,175 100,175 C45,175 25,140 25,100 C25,65 45,25 100,25',
      'M125,145 L165,180',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_R',
    label: 'R',
    instruction: 'Trace the letter R!',
    hint: 'R is like P with a leg!',
    strokes: [
      'M55,30 L55,170',
      'M55,30 L110,30 C150,30 158,60 140,80 C125,95 100,100 55,100',
      'M105,100 L155,170',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_U',
    label: 'U',
    instruction: 'Trace the letter U!',
    hint: 'U goes down, curves, and comes back up!',
    strokes: [
      'M45,30 L45,130 C45,170 80,178 100,175 C125,172 155,165 155,130 L155,30',
    ],
    category: 'uppercase',
  },
  {
    id: 'upper_V',
    label: 'V',
    instruction: 'Trace the letter V!',
    hint: 'V goes down to a point and back up!',
    strokes: ['M30,30 L100,170 L170,30'],
    category: 'uppercase',
  },
  {
    id: 'upper_W',
    label: 'W',
    instruction: 'Trace the letter W!',
    hint: 'W goes down, up, down, up — like two Vs!',
    strokes: ['M15,30 L55,170 L100,60 L145,170 L185,30'],
    category: 'uppercase',
  },
  {
    id: 'upper_Y',
    label: 'Y',
    instruction: 'Trace the letter Y!',
    hint: 'Y has two lines that meet and one goes down!',
    strokes: ['M35,30 L100,100', 'M165,30 L100,100 L100,170'],
    category: 'uppercase',
  },
];

// ── Lowercase letters (age 7-8) ─────────────────────────────────

const LOWERCASE: CharacterData[] = [
  {
    id: 'lower_a',
    label: 'a',
    instruction: 'Trace the lowercase a!',
    hint: 'Little a has a circle and a line going down!',
    strokes: [
      'M130,70 C120,50 95,45 75,55 C55,65 45,85 50,110 C55,135 80,145 100,140 C120,135 135,115 130,70 L130,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_b',
    label: 'b',
    instruction: 'Trace the lowercase b!',
    hint: 'Little b has a tall line and a bump on the right!',
    strokes: [
      'M60,25 L60,145',
      'M60,80 C75,55 110,50 130,70 C150,90 150,120 130,140 C110,155 75,150 60,130',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_c',
    label: 'c',
    instruction: 'Trace the lowercase c!',
    hint: 'Little c is a small curve!',
    strokes: [
      'M140,70 C125,50 95,45 75,60 C50,80 50,120 75,140 C95,155 125,150 140,135',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_d',
    label: 'd',
    instruction: 'Trace the lowercase d!',
    hint: 'Little d has a circle and a tall line on the right!',
    strokes: [
      'M140,25 L140,145',
      'M140,80 C125,55 90,50 70,70 C50,90 50,120 70,140 C90,155 125,150 140,130',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_e',
    label: 'e',
    instruction: 'Trace the lowercase e!',
    hint: 'Little e starts in the middle and goes around!',
    strokes: [
      'M55,100 L145,100 C145,70 125,50 100,50 C70,50 50,75 50,105 C50,135 75,155 105,155 C125,155 140,145 150,130',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_m',
    label: 'm',
    instruction: 'Trace the lowercase m!',
    hint: 'Little m has two humps!',
    strokes: [
      'M35,145 L35,65 C45,50 65,50 80,65 L80,145',
      'M80,65 C90,50 110,50 125,65 L125,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_n',
    label: 'n',
    instruction: 'Trace the lowercase n!',
    hint: 'Little n has one hump!',
    strokes: [
      'M55,145 L55,65 C70,50 100,45 125,65 L125,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_o',
    label: 'o',
    instruction: 'Trace the lowercase o!',
    hint: 'Little o is a small circle!',
    strokes: [
      'M100,50 C60,50 40,80 45,110 C50,140 75,155 100,155 C125,155 150,140 155,110 C160,80 140,50 100,50',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_s',
    label: 's',
    instruction: 'Trace the lowercase s!',
    hint: 'Little s wiggles like a tiny snake!',
    strokes: [
      'M130,65 C115,45 80,45 65,60 C50,75 70,90 100,100 C130,110 145,125 130,145 C115,160 80,160 60,140',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_t',
    label: 't',
    instruction: 'Trace the lowercase t!',
    hint: 'Little t is a line with a cross!',
    strokes: ['M90,25 L90,145 C90,160 110,165 125,155', 'M55,70 L125,70'],
    category: 'lowercase',
  },
  {
    id: 'lower_f',
    label: 'f',
    instruction: 'Trace the lowercase f!',
    hint: 'Little f curves at the top and has a cross!',
    strokes: [
      'M125,40 C115,22 95,18 82,30 C72,42 72,58 72,145',
      'M50,78 L115,78',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_g',
    label: 'g',
    instruction: 'Trace the lowercase g!',
    hint: 'Little g has a circle and a tail that hangs down!',
    strokes: [
      'M132,68 C122,48 98,42 78,52 C58,65 52,85 57,108 C62,128 85,138 105,132 C125,126 137,110 132,68 L132,150 C130,175 112,185 88,178',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_h',
    label: 'h',
    instruction: 'Trace the lowercase h!',
    hint: 'Little h has a tall line and a bump!',
    strokes: [
      'M62,25 L62,145',
      'M62,82 C78,58 112,52 132,68 L132,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_i',
    label: 'i',
    instruction: 'Trace the lowercase i!',
    hint: 'Little i is a line with a dot on top!',
    strokes: [
      'M92,36 L108,36',
      'M100,58 L100,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_j',
    label: 'j',
    instruction: 'Trace the lowercase j!',
    hint: 'Little j has a dot and a hook at the bottom!',
    strokes: [
      'M108,36 L124,36',
      'M116,58 L116,155 C116,178 96,183 78,173',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_k',
    label: 'k',
    instruction: 'Trace the lowercase k!',
    hint: 'Little k has a tall line and two short lines!',
    strokes: [
      'M62,25 L62,145',
      'M130,58 L62,102 L135,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_l',
    label: 'l',
    instruction: 'Trace the lowercase l!',
    hint: 'Little l is just a tall straight line!',
    strokes: ['M100,25 L100,145'],
    category: 'lowercase',
  },
  {
    id: 'lower_p',
    label: 'p',
    instruction: 'Trace the lowercase p!',
    hint: 'Little p has a line going down and a bump on the right!',
    strokes: [
      'M62,55 L62,180',
      'M62,72 C78,52 112,48 132,65 C148,82 148,112 132,130 C112,148 78,145 62,125',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_q',
    label: 'q',
    instruction: 'Trace the lowercase q!',
    hint: 'Little q has a circle and a line going down on the right!',
    strokes: [
      'M138,55 L138,180',
      'M138,72 C122,52 88,48 68,65 C48,82 48,112 68,130 C88,148 122,145 138,125',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_r',
    label: 'r',
    instruction: 'Trace the lowercase r!',
    hint: 'Little r has a line and a tiny curve at the top!',
    strokes: [
      'M65,55 L65,145',
      'M65,72 C82,52 108,48 135,58',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_u',
    label: 'u',
    instruction: 'Trace the lowercase u!',
    hint: 'Little u goes down, curves, and back up!',
    strokes: [
      'M60,55 L60,120 C60,148 88,155 108,148 C128,142 140,125 140,58',
      'M140,58 L140,145',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_v',
    label: 'v',
    instruction: 'Trace the lowercase v!',
    hint: 'Little v goes down to a point and back up!',
    strokes: ['M48,55 L100,145 L152,55'],
    category: 'lowercase',
  },
  {
    id: 'lower_w',
    label: 'w',
    instruction: 'Trace the lowercase w!',
    hint: 'Little w goes down, up, down, up!',
    strokes: ['M28,55 L62,145 L100,72 L138,145 L172,55'],
    category: 'lowercase',
  },
  {
    id: 'lower_x',
    label: 'x',
    instruction: 'Trace the lowercase x!',
    hint: 'Little x has two lines that cross!',
    strokes: ['M48,55 L152,145', 'M152,55 L48,145'],
    category: 'lowercase',
  },
  {
    id: 'lower_y',
    label: 'y',
    instruction: 'Trace the lowercase y!',
    hint: 'Little y has two lines and a tail!',
    strokes: [
      'M52,55 L100,115',
      'M148,55 L100,115 L72,178',
    ],
    category: 'lowercase',
  },
  {
    id: 'lower_z',
    label: 'z',
    instruction: 'Trace the lowercase z!',
    hint: 'Little z goes across, diagonal, and across again!',
    strokes: ['M52,55 L148,55 L52,145 L148,145'],
    category: 'lowercase',
  },
];

// ── Spelling challenges (age 9-10) ─────────────────────────────
// Each "word" is actually a sequence of individual letter questions.
// The game presents them one letter at a time: "Spell cat — write c!"
// This works correctly because each letter uses the full 200×200 viewBox.

export interface SpellingChallenge {
  /** Unique key */
  id: string;
  /** The full word */
  word: string;
  /** Spoken instruction for the whole word */
  instruction: string;
  /** Hint */
  hint: string;
  /** The individual CharacterData entries for each letter */
  letters: CharacterData[];
}

function buildSpelling(id: string, word: string, instruction: string, hint: string): SpellingChallenge {
  const letters: CharacterData[] = [];
  for (const ch of word) {
    const def = LOWERCASE.find((lc) => lc.label === ch);
    if (def) {
      letters.push({
        ...def,
        id: `${id}_${ch}_${letters.length}`,
        instruction: `Write the letter "${ch}"!`,
      });
    }
  }
  return { id, word, instruction, hint, letters };
}

export const SPELLING_CHALLENGES: SpellingChallenge[] = [
  // 4-letter words with blends
  buildSpelling('spell_frog', 'frog', 'Spell the word "frog"!', 'F-R-O-G spells frog!'),
  buildSpelling('spell_drum', 'drum', 'Spell the word "drum"!', 'D-R-U-M spells drum!'),
  buildSpelling('spell_clap', 'clap', 'Spell the word "clap"!', 'C-L-A-P spells clap!'),
  buildSpelling('spell_glow', 'glow', 'Spell the word "glow"!', 'G-L-O-W spells glow!'),
  buildSpelling('spell_snap', 'snap', 'Spell the word "snap"!', 'S-N-A-P spells snap!'),
  // 5-letter words
  buildSpelling('spell_plane', 'plane', 'Spell the word "plane"!', 'P-L-A-N-E spells plane!'),
  buildSpelling('spell_brave', 'brave', 'Spell the word "brave"!', 'B-R-A-V-E spells brave!'),
  buildSpelling('spell_cloud', 'cloud', 'Spell the word "cloud"!', 'C-L-O-U-D spells cloud!'),
  buildSpelling('spell_dream', 'dream', 'Spell the word "dream"!', 'D-R-E-A-M spells dream!'),
  buildSpelling('spell_frost', 'frost', 'Spell the word "frost"!', 'F-R-O-S-T spells frost!'),
  buildSpelling('spell_globe', 'globe', 'Spell the word "globe"!', 'G-L-O-B-E spells globe!'),
  buildSpelling('spell_shark', 'shark', 'Spell the word "shark"!', 'S-H-A-R-K spells shark!'),
  buildSpelling('spell_plant', 'plant', 'Spell the word "plant"!', 'P-L-A-N-T spells plant!'),
  buildSpelling('spell_think', 'think', 'Spell the word "think"!', 'T-H-I-N-K spells think!'),
  // 6-letter words
  buildSpelling('spell_bridge', 'bridge', 'Spell the word "bridge"!', 'B-R-I-D-G-E spells bridge!'),
  buildSpelling('spell_prince', 'prince', 'Spell the word "prince"!', 'P-R-I-N-C-E spells prince!'),
  buildSpelling('spell_stream', 'stream', 'Spell the word "stream"!', 'S-T-R-E-A-M spells stream!'),
  buildSpelling('spell_strong', 'strong', 'Spell the word "strong"!', 'S-T-R-O-N-G spells strong!'),
  buildSpelling('spell_flight', 'flight', 'Spell the word "flight"!', 'F-L-I-G-H-T spells flight!'),
  buildSpelling('spell_throne', 'throne', 'Spell the word "throne"!', 'T-H-R-O-N-E spells throne!'),
];

// ── Simple spelling challenges for age 7-8 (3-letter CVC words) ─
export const SPELLING_CHALLENGES_78: SpellingChallenge[] = [
  buildSpelling('spell78_cat', 'cat', 'Spell the word "cat"!', 'C-A-T spells cat!'),
  buildSpelling('spell78_dog', 'dog', 'Spell the word "dog"!', 'D-O-G spells dog!'),
  buildSpelling('spell78_sun', 'sun', 'Spell the word "sun"!', 'S-U-N spells sun!'),
  buildSpelling('spell78_hat', 'hat', 'Spell the word "hat"!', 'H-A-T spells hat!'),
  buildSpelling('spell78_bed', 'bed', 'Spell the word "bed"!', 'B-E-D spells bed!'),
  buildSpelling('spell78_cup', 'cup', 'Spell the word "cup"!', 'C-U-P spells cup!'),
  buildSpelling('spell78_map', 'map', 'Spell the word "map"!', 'M-A-P spells map!'),
  buildSpelling('spell78_fox', 'fox', 'Spell the word "fox"!', 'F-O-X spells fox!'),
  buildSpelling('spell78_bug', 'bug', 'Spell the word "bug"!', 'B-U-G spells bug!'),
  buildSpelling('spell78_red', 'red', 'Spell the word "red"!', 'R-E-D spells red!'),
];

// ── Confusing letter pairs (age 9-10) ──────────────────────────
// Letters that kids frequently mix up. Presented individually with
// emphasis on distinguishing them.

const CONFUSING_PAIRS: CharacterData[] = [
  ...(() => {
    const b = LOWERCASE.find((c) => c.label === 'b')!;
    const d = LOWERCASE.find((c) => c.label === 'd')!;
    return [
      { ...b, id: 'confuse_b', instruction: 'Write lowercase "b" — bump on the right!', hint: 'The bat comes first, then the ball! Line then bump.' },
      { ...d, id: 'confuse_d', instruction: 'Write lowercase "d" — bump on the left!', hint: 'Think "d" for drum — circle first, then the stick!' },
    ];
  })(),
  ...(() => {
    const p = LOWERCASE.find((c) => c.label === 'p')!;
    const q = LOWERCASE.find((c) => c.label === 'q')!;
    return [
      { ...p, id: 'confuse_p', instruction: 'Write lowercase "p" — tail goes down, bump right!', hint: 'P points its bump to the right!' },
      { ...q, id: 'confuse_q', instruction: 'Write lowercase "q" — tail goes down, bump left!', hint: 'Q points its bump to the left!' },
    ];
  })(),
  ...(() => {
    const m = LOWERCASE.find((c) => c.label === 'm')!;
    const n = LOWERCASE.find((c) => c.label === 'n')!;
    return [
      { ...m, id: 'confuse_m', instruction: 'Write lowercase "m" — it has TWO humps!', hint: 'M has two mountains!' },
      { ...n, id: 'confuse_n', instruction: 'Write lowercase "n" — it has ONE hump!', hint: 'N has just one hill!' },
    ];
  })(),
];

// ── Age-band question pools ──────────────────────────────────────

/**
 * Get the character pool for the given age band.
 * Each pool is progressively more complex.
 */
export function getCharacterPool(ageBand: AgeBand): CharacterData[] {
  switch (ageBand) {
    case '3-4':
      return PRE_WRITING;
    case '5-6':
      return [...DIGITS, ...DIGITS, ...UPPERCASE.slice(0, 5)]; // numbers heavily weighted + a few uppercase
    case '7-8':
      return [...UPPERCASE, ...LOWERCASE]; // full alphabet, both cases
    case '9-10':
      return [...LOWERCASE, ...CONFUSING_PAIRS]; // lowercase + confusing letter pairs
    default:
      return PRE_WRITING;
  }
}

/**
 * Get tolerance radius in pixels (in 200×200 viewBox coordinates) for trace scoring.
 * Younger kids get more forgiving scoring.
 * With bidirectional scoring, these values are tuned to catch real mistakes
 * while still allowing the wobbliness natural to young children.
 */
export function getToleranceForAge(ageBand: AgeBand): number {
  switch (ageBand) {
    case '3-4':
      return 38;
    case '5-6':
      return 30;
    case '7-8':
      return 22;
    case '9-10':
      return 22; // wide spelling canvas makes letters smaller, so keep forgiving
    default:
      return 35;
  }
}

/**
 * Stroke width for the child's drawing trail.
 * Younger = thicker = easier motor control.
 */
export function getStrokeWidthForAge(ageBand: AgeBand): number {
  switch (ageBand) {
    case '3-4':
      return 14;
    case '5-6':
      return 12;
    case '7-8':
      return 9;
    case '9-10':
      return 7;
    default:
      return 12;
  }
}
