package com.group10.pokedex.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.group10.pokedex.model.Pokemon;

@Repository
public interface PokemonRepository extends JpaRepository<Pokemon, Long> {

    // ── Search & Filter ──────────────────────────────────────────────────────
    List<Pokemon> findByNameContainingIgnoreCase(String name);

    Optional<Pokemon> findByNameIgnoreCase(String name);

    Optional<Pokemon> findByPokemonNumber(int pokemonNumber);

    List<Pokemon> findByTypeIgnoreCase(String type);

    List<Pokemon> findByType2IgnoreCase(String type2);

    // ── Trainer Flags ────────────────────────────────────────────────────────
    List<Pokemon> findByCaughtTrue();

    List<Pokemon> findByFavoriteTrue();

    List<Pokemon> findByLegendaryTrue();

    // ── Ordering ─────────────────────────────────────────────────────────────
    List<Pokemon> findAllByOrderByPokemonNumberAsc();

    // ── Efficient Count Queries (no full list load) ──────────────────────────
    long countByCaughtTrue();

    long countByFavoriteTrue();

    long countByLegendaryTrue();
}