<?php

namespace Tests\Feature;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminCsrfTokenTest extends TestCase
{
    public function test_login_and_logout_return_the_current_session_csrf_token(): void
    {
        $userId = '05d8cad9-0b1b-414a-a2b2-cb6dbf839266';

        config([
            'services.supabase.url' => 'https://project.supabase.co',
            'services.supabase.anon_key' => 'test-anon-key',
        ]);

        Http::fake([
            'project.supabase.co/auth/v1/token*' => Http::response([
                'user' => ['id' => $userId],
                'access_token' => 'test-access-token',
            ]),
            'project.supabase.co/auth/v1/user' => Http::response([
                'id' => $userId,
            ]),
        ]);

        $roleQuery = \Mockery::mock(Builder::class);
        $roleQuery->shouldReceive('where')->andReturnSelf()->times(4);
        $roleQuery->shouldReceive('exists')->andReturnTrue()->twice();
        DB::shouldReceive('table')
            ->with('user_roles')
            ->andReturn($roleQuery)
            ->twice();

        $initialToken = $this->getJson('/api/csrf-token')
            ->assertOk()
            ->json('csrf_token');

        $login = $this->postJson('/api/admin/login', [
            'email' => 'parent@example.com',
            'password' => 'valid-password-123',
        ], [
            'X-CSRF-TOKEN' => $initialToken,
        ])->assertOk();

        $loginToken = $login->json('csrf_token');
        $this->assertIsString($loginToken);
        $this->assertNotSame($initialToken, $loginToken);

        $logout = $this->postJson('/api/admin/logout', [], [
            'X-CSRF-TOKEN' => $loginToken,
        ])->assertOk();

        $logoutToken = $logout->json('csrf_token');
        $this->assertIsString($logoutToken);
        $this->assertNotSame($loginToken, $logoutToken);
    }
}
