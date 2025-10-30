/**
 * Player Repository Implementation (In-Memory)
 * SOLID-Prinzip: Single Responsibility - Verwaltet nur Players
 * Implementiert IPlayerRepository Interface
 */
import type { IPlayerRepository, Player } from '$lib/shared';

class PlayerRepository implements IPlayerRepository {
	private players = new Map<string, Player>();

	getAll(): Player[] {
		return Array.from(this.players.values());
	}

	getById(id: string): Player | null {
		return this.players.get(id) || null;
	}

	getByName(name: string): Player | null {
		const nameLower = name.toLowerCase();
		for (const player of this.players.values()) {
			if (player.name.toLowerCase() === nameLower) {
				return player;
			}
		}
		return null;
	}

	create(name: string): Player {
		const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const player: Player = {
			id,
			name: name.trim(),
			score: 0,
			registeredAt: Date.now()
		};
		this.players.set(id, player);
		return player;
	}

	add(player: Player): void {
		// Füge Player direkt hinzu (ohne neue ID zu generieren)
		this.players.set(player.id, player);
	}

	update(id: string, updates: Partial<Player>): Player | null {
		const player = this.players.get(id);
		if (!player) {
			return null;
		}

		const updated: Player = { ...player, ...updates };
		this.players.set(id, updated);
		return updated;
	}

	delete(id: string): boolean {
		return this.players.delete(id);
	}

	exists(name: string): boolean {
		return this.getByName(name) !== null;
	}
}

// Singleton Instance
let playerRepositoryInstance: PlayerRepository | null = null;

export function getPlayerRepository(): PlayerRepository {
	if (!playerRepositoryInstance) {
		playerRepositoryInstance = new PlayerRepository();
	}
	return playerRepositoryInstance;
}

