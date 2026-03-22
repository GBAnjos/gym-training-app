/**
 * Maps legacy exercise IDs (from treinos.js) to free-exercise-db exercise folder names.
 * These folder names are used to construct image URLs and to look up exercises in the bundle/IDB.
 */
export const exerciseIdMap = {
  supino_reto: 'Barbell_Bench_Press_-_Medium_Grip',
  supino_inclinado_haltere: 'Incline_Dumbbell_Press',
  desenvolvimento_militar: 'Standing_Military_Press',
  elevacao_lateral: 'Side_Lateral_Raise',
  triceps_testa: 'Lying_Triceps_Press',
  triceps_corda: 'Triceps_Pushdown_-_Rope_Attachment',
  barra_fixa: 'Pullups',
  remada_curvada: 'Bent_Over_Barbell_Row',
  remada_unilateral: 'One-Arm_Dumbbell_Row',
  pullover: 'Dumbbell_Pullover',
  rosca_direta: 'Barbell_Curl',
  rosca_martelo: 'Hammer_Curls',
  agachamento: 'Barbell_Squat',
  jump_squat: 'Freehand_Jump_Squat',
  leg_press: 'Leg_Press',
  afundo: 'Dumbbell_Lunges',
  extensora: 'Leg_Extensions',
  panturrilha_pe: 'Standing_Calf_Raises',
  supino_inclinado_barra: 'Barbell_Incline_Bench_Press_-_Medium_Grip',
  crucifixo_inclinado: 'Incline_Dumbbell_Flyes',
  push_press: 'Push_Press',
  elevacao_frontal: 'Front_Dumbbell_Raise',
  paralelas: 'Dips_-_Triceps_Version',
  triceps_overhead: 'Standing_Dumbbell_Triceps_Extension',
  terra: 'Barbell_Deadlift',
  remada_cavalinho: 'T-Bar_Row_with_Handle',
  pulldown_fechado: 'Close-Grip_Lat_Pulldown',
  face_pull: 'Face_Pull',
  encolhimento: 'Barbell_Shrug',
  rosca_scott: 'Preacher_Curl',
  stiff: 'Stiff-Legged_Barbell_Deadlift',
  mesa_flexora: 'Lying_Leg_Curls',
  agachamento_bulgaro: 'Single_Leg_Squat',
  hip_thrust: 'Barbell_Hip_Thrust',
  abdutora: 'Thigh_Abductor',
  panturrilha_sentado: 'Seated_Calf_Raise',
};

export function getExerciseDbName(legacyId) {
  return exerciseIdMap[legacyId] || null;
}
