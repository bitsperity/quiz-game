/**
 * Interface für Player Repository
 * SOLID-Prinzip: Single Responsibility
 */
import type { Player } from '../types';

export interface IPlayerRepository {
	getAll(): Player[];
	getById(id: string): Player | null;
	getByName(name: string): Player | null;
	create(name: string): Player;
	update(id: string, updates: Partial<Player>): Player | null;
	delete(id: string): boolean;
	exists(name: string): boolean;
}

