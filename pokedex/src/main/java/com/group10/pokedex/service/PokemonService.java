package com.group10.pokedex.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.group10.pokedex.exception.ResourceNotFoundException;
import com.group10.pokedex.model.Pokemon;
import com.group10.pokedex.repository.PokemonRepository;

@Service
@Transactional
public class PokemonService {

    private static final Logger logger = LoggerFactory.getLogger(PokemonService.class);
    private final PokemonRepository repository;

    public PokemonService(PokemonRepository repository) {
        this.repository = repository;
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    public List<Pokemon> getAll() {
        return repository.findAllByOrderByPokemonNumberAsc();
    }

    public Optional<Pokemon> getById(Long id) {
        return repository.findById(id);
    }

    /**
     * Fetch by ID or throw 404 — used by endpoints that require the Pokémon to
     * exist.
     */
    public Pokemon getByIdOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pokémon not found with id: " + id));
    }

    public List<Pokemon> searchByName(String name) {
        return repository.findByNameContainingIgnoreCase(name);
    }

    public List<Pokemon> filterByType(String type) {
        return repository.findByTypeIgnoreCase(type);
    }

    public List<Pokemon> getCaught() {
        return repository.findByCaughtTrue();
    }

    public List<Pokemon> getFavorites() {
        return repository.findByFavoriteTrue();
    }

    public List<Pokemon> getLegendary() {
        return repository.findByLegendaryTrue();
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    public Pokemon add(Pokemon pokemon) {
        logger.info("Adding new Pokémon: {}", pokemon.getName());
        return repository.save(pokemon);
    }

    public Pokemon update(Long id, Pokemon updated) {
        logger.info("Updating Pokémon id={}", id);
        Pokemon existing = getByIdOrThrow(id);
        existing.setPokemonNumber(updated.getPokemonNumber());
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setType2(updated.getType2());
        existing.setHeight(updated.getHeight());
        existing.setWeight(updated.getWeight());
        existing.setDescription(updated.getDescription());
        existing.setHp(updated.getHp());
        existing.setAttack(updated.getAttack());
        existing.setDefense(updated.getDefense());
        existing.setSpecialAttack(updated.getSpecialAttack());
        existing.setSpecialDefense(updated.getSpecialDefense());
        existing.setSpeed(updated.getSpeed());
        existing.setLegendary(updated.isLegendary());
        return repository.save(existing);
    }

    public Pokemon toggleCaught(Long id) {
        Pokemon p = getByIdOrThrow(id);
        p.setCaught(!p.isCaught());
        logger.info("Pokémon {} caught={}", p.getName(), p.isCaught());
        return repository.save(p);
    }

    public Pokemon toggleFavorite(Long id) {
        Pokemon p = getByIdOrThrow(id);
        p.setFavorite(!p.isFavorite());
        logger.info("Pokémon {} favorite={}", p.getName(), p.isFavorite());
        return repository.save(p);
    }

    public Pokemon toggleLegendary(Long id) {
        Pokemon p = getByIdOrThrow(id);
        p.setLegendary(!p.isLegendary());
        logger.info("Pokémon {} legendary={}", p.getName(), p.isLegendary());
        return repository.save(p);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Pokémon not found with id: " + id);
        }
        logger.info("Deleting Pokémon id={}", id);
        repository.deleteById(id);
    }

    // ── Seed ─────────────────────────────────────────────────────────────────

    public int seedGen1FromApi() {
        RestTemplate restTemplate = new RestTemplate();
        String listUrl = "https://pokeapi.co/api/v2/pokemon?limit=151";
        PokeApiListResponse listResponse = restTemplate.getForObject(listUrl, PokeApiListResponse.class);
        if (listResponse == null || listResponse.results == null) {
            return 0;
        }

        int upserted = 0;
        List<PokeApiListResult> sorted = new ArrayList<>(listResponse.results);
        sorted.sort(Comparator.comparing(r -> r.name));

        for (PokeApiListResult result : sorted) {
            try {
                PokeApiPokemon apiPokemon = restTemplate.getForObject(result.url, PokeApiPokemon.class);
                if (apiPokemon == null || apiPokemon.id == null) {
                    continue;
                }

                Pokemon entity = repository.findByPokemonNumber(apiPokemon.id)
                        .orElseGet(Pokemon::new);

                entity.setPokemonNumber(apiPokemon.id);
                entity.setName(titleCase(apiPokemon.name));
                entity.setType(getTypeName(apiPokemon, 1));
                entity.setType2(getTypeName(apiPokemon, 2));
                entity.setHeight(apiPokemon.height == null ? 0.0 : apiPokemon.height / 10.0);
                entity.setWeight(apiPokemon.weight == null ? 0.0 : apiPokemon.weight / 10.0);
                entity.setHp(getStat(apiPokemon, "hp"));
                entity.setAttack(getStat(apiPokemon, "attack"));
                entity.setDefense(getStat(apiPokemon, "defense"));
                entity.setSpecialAttack(getStat(apiPokemon, "special-attack"));
                entity.setSpecialDefense(getStat(apiPokemon, "special-defense"));
                entity.setSpeed(getStat(apiPokemon, "speed"));

                repository.save(entity);
                upserted++;
            } catch (Exception ex) {
                logger.warn("Failed to seed from {}: {}", result.url, ex.getMessage());
            }
        }

        return upserted;
    }

    private static String getTypeName(PokeApiPokemon apiPokemon, int slot) {
        if (apiPokemon.types == null) {
            return null;
        }
        for (PokeApiPokemonType t : apiPokemon.types) {
            if (t != null && t.slot != null && t.slot == slot && t.type != null) {
                return titleCase(t.type.name);
            }
        }
        return null;
    }

    private static int getStat(PokeApiPokemon apiPokemon, String statName) {
        if (apiPokemon.stats == null) {
            return 0;
        }
        for (PokeApiPokemonStat s : apiPokemon.stats) {
            if (s != null && s.stat != null && statName.equalsIgnoreCase(s.stat.name)) {
                return s.base_stat == null ? 0 : s.base_stat;
            }
        }
        return 0;
    }

    private static String titleCase(String name) {
        if (name == null || name.isBlank()) {
            return name;
        }
        String[] parts = name.split("-");
        for (int i = 0; i < parts.length; i++) {
            String p = parts[i];
            if (!p.isEmpty()) {
                parts[i] = p.substring(0, 1).toUpperCase(Locale.ROOT) + p.substring(1).toLowerCase(Locale.ROOT);
            }
        }
        return String.join("-", parts);
    }

    private static class PokeApiListResponse {
        public List<PokeApiListResult> results;
    }

    private static class PokeApiListResult {
        public String name;
        public String url;
    }

    private static class PokeApiPokemon {
        public Integer id;
        public String name;
        public Integer height;
        public Integer weight;
        public List<PokeApiPokemonType> types;
        public List<PokeApiPokemonStat> stats;
    }

    private static class PokeApiPokemonType {
        public Integer slot;
        public PokeApiNamedResource type;
    }

    private static class PokeApiPokemonStat {
        public Integer base_stat;
        public PokeApiNamedResource stat;
    }

    private static class PokeApiNamedResource {
        public String name;
    }

    // ── Stats / Analytics ─────────────────────────────────────────────────────

    /** Efficient counts — no full list loaded */
    public long getTotalCount() {
        return repository.count();
    }

    public long getCaughtCount() {
        return repository.countByCaughtTrue();
    }

    public long getFavoriteCount() {
        return repository.countByFavoriteTrue();
    }

    public long getLegendaryCount() {
        return repository.countByLegendaryTrue();
    }

    public Map<String, Long> getTypeDistribution() {
        return repository.findAll().stream()
                .collect(Collectors.groupingBy(Pokemon::getType, Collectors.counting()));
    }

    public List<String> getAllUniqueTypes() {
        return repository.findAll().stream()
                .map(Pokemon::getType)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }
}