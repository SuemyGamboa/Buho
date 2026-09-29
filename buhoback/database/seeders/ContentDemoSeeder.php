<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\LearningActivity;
use App\Models\Reward;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class ContentDemoSeeder extends Seeder
{
    public function run(): void
    {
        $subject = Subject::updateOrCreate(
            ['name' => 'Matemáticas de prueba'],
            [
                'description' => 'Actividades de demostración para descubrir números, patrones y formas.',
                'image_url' => null,
                'icon' => 'calculate',
                'color' => '#4d96ff',
                'is_active' => true,
                'sort_order' => 0,
            ],
        );

        $achievements = collect([
            ['name' => 'Detective de patrones', 'description' => 'Completó un reto de patrones.', 'icon_url' => null],
            ['name' => 'Memoria brillante', 'description' => 'Encontró todas las parejas.', 'icon_url' => null],
            ['name' => 'Rayo matemático', 'description' => 'Terminó un reto contra el tiempo.', 'icon_url' => null],
        ])->mapWithKeys(fn (array $achievement): array => [
            $achievement['name'] => Achievement::firstOrCreate(
                ['name' => $achievement['name']],
                ['description' => $achievement['description'], 'icon_url' => $achievement['icon_url']],
            )->getKey(),
        ]);

        $rewards = collect([
            ['name' => 'Sombrero de explorador', 'type' => 'avatar'],
            ['name' => 'Pegatina de estrella', 'type' => 'sticker'],
            ['name' => 'Capa estelar', 'type' => 'visual'],
        ])->mapWithKeys(fn (array $reward): array => [
            $reward['name'] => Reward::firstOrCreate(
                ['name' => $reward['name']],
                ['type' => $reward['type']],
            )->getKey(),
        ]);

        $activities = [
            [
                'name' => 'Memorama de números',
                'description' => 'Encuentra las parejas de números iguales.',
                'game_type' => 'memorama',
                'difficulty' => 1,
                'instructions' => 'Voltea las cartas de dos en dos y encuentra las parejas.',
                'content' => [
                    'time_limit' => 60,
                    'pairs' => [
                        ['id' => 'p1', 'content_a' => '1️⃣', 'content_b' => 'Uno', 'label' => 'Número uno'],
                        ['id' => 'p2', 'content_a' => '2️⃣', 'content_b' => 'Dos', 'label' => 'Número dos'],
                        ['id' => 'p3', 'content_a' => '3️⃣', 'content_b' => 'Tres', 'label' => 'Número tres'],
                        ['id' => 'p4', 'content_a' => '4️⃣', 'content_b' => 'Cuatro', 'label' => 'Número cuatro'],
                    ],
                ],
                'badge_name' => 'Memoria brillante',
                'config' => [
                    'time_limit' => 60,
                    'pairs' => [
                        ['id' => 'p1', 'content_a' => '1️⃣', 'content_b' => 'Uno', 'label' => 'Número uno'],
                        ['id' => 'p2', 'content_a' => '2️⃣', 'content_b' => 'Dos', 'label' => 'Número dos'],
                        ['id' => 'p3', 'content_a' => '3️⃣', 'content_b' => 'Tres', 'label' => 'Número tres'],
                        ['id' => 'p4', 'content_a' => '4️⃣', 'content_b' => 'Cuatro', 'label' => 'Número cuatro'],
                    ],
                ],
            ],
            [
                'name' => 'Lleva cada figura a su lugar',
                'description' => 'Relaciona cada figura con su forma.',
                'game_type' => 'drag_drop',
                'difficulty' => 2,
                'instructions' => 'Arrastra cada objeto hasta la figura que tiene la misma forma.',
                'content' => [
                    'zones' => [
                        ['id' => 'z1', 'name' => 'Círculo', 'content' => '⚪'],
                        ['id' => 'z2', 'name' => 'Cuadrado', 'content' => '◻️'],
                    ],
                    'items' => [
                        ['id' => 'i1', 'content' => 'Pelota', 'correct_zone' => 'z1'],
                        ['id' => 'i2', 'content' => 'Ventana', 'correct_zone' => 'z2'],
                    ],
                ],
                'badge_name' => null,
                'config' => [
                    'zones' => [
                        ['id' => 'z1', 'name' => 'Círculo', 'content' => '⚪'],
                        ['id' => 'z2', 'name' => 'Cuadrado', 'content' => '◻️'],
                    ],
                    'items' => [
                        ['id' => 'i1', 'content' => 'Pelota', 'correct_zone' => 'z1'],
                        ['id' => 'i2', 'content' => 'Ventana', 'correct_zone' => 'z2'],
                    ],
                ],
            ],
            [
                'name' => 'Elige la respuesta',
                'description' => 'Practica contar con grupos de objetos.',
                'game_type' => 'quiz',
                'difficulty' => 1,
                'instructions' => 'Cuenta las manzanas y elige la respuesta correcta.',
                'content' => [
                    'questions' => [[
                        'id' => 'q1',
                        'question' => '¿Cuántas manzanas hay?',
                        'image_url' => null,
                        'options' => [
                            ['id' => 'o1', 'content' => '2', 'is_correct' => false],
                            ['id' => 'o2', 'content' => '3', 'is_correct' => true],
                            ['id' => 'o3', 'content' => '4', 'is_correct' => false],
                        ],
                    ]],
                ],
                'config' => [
                    'questions' => [[
                        'id' => 'q1',
                        'question' => '¿Cuántas manzanas hay?',
                        'image_url' => null,
                        'options' => [
                            ['id' => 'o1', 'content' => '2', 'is_correct' => false],
                            ['id' => 'o2', 'content' => '3', 'is_correct' => true],
                            ['id' => 'o3', 'content' => '4', 'is_correct' => false],
                        ],
                    ]],
                ],
                'badge_name' => null,
            ],
            [
                'name' => 'Relaciona sumas y resultados',
                'description' => 'Une cada operación con su resultado.',
                'game_type' => 'matching',
                'difficulty' => 2,
                'instructions' => 'Relaciona cada suma con el resultado correcto.',
                'content' => [
                    'pairs' => [
                        ['id' => 'm1', 'left' => '2 + 2', 'right' => '4'],
                        ['id' => 'm2', 'left' => '3 + 2', 'right' => '5'],
                        ['id' => 'm3', 'left' => '4 + 2', 'right' => '6'],
                    ],
                ],
                'config' => [
                    'pairs' => [
                        ['id' => 'm1', 'left' => '2 + 2', 'right' => '4'],
                        ['id' => 'm2', 'left' => '3 + 2', 'right' => '5'],
                        ['id' => 'm3', 'left' => '4 + 2', 'right' => '6'],
                    ],
                ],
                'badge_name' => null,
            ],
        ];

        LearningActivity::query()
            ->where('subject_id', $subject->id)
            ->whereIn('name', [
                'Completa el patrón de estrellas',
                'Encuentra los números pares',
                'Reto relámpago de sumas',
                'Construye una torre de diez',
                'Apunta al resultado correcto',
                'Ordena las figuras por categoría',
                'Suma las frutas',
            ])
            ->update(['is_active' => false]);

        foreach ($activities as $index => $activity) {
            LearningActivity::updateOrCreate(
                [
                    'subject_id' => $subject->id,
                    'name' => $activity['name'],
                ],
                [
                    ...$activity,
                    'achievement_id' => $achievements->get($activity['badge_name']),
                    'reward_item_id' => $index === 0 ? $rewards->get('Sombrero de explorador') : null,
                    'unlock_after' => 0,
                    'reward_stars' => 1 + ($index % 3),
                    'reward_coins' => 10 + ($index * 5),
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ],
            );
        }
    }
}
