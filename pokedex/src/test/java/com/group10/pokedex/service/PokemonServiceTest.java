package com.group10.pokedex.service;

import com.group10.pokedex.exception.ResourceNotFoundException;
import com.group10.pokedex.model.Pokemon;
import com.group10.pokedex.repository.PokemonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PokemonService Unit Tests")
class PokemonServiceTest {

    @Mock
    private PokemonRepository repository;

    @InjectMocks
    private PokemonService service;

    private Pokemon pikachu;

    @BeforeEach
    void setUp() {
        pikachu = new Pokemon();
        pikachu.setId(1L);
        pikachu.setPokemonNumber(25);
        pikachu.setName("Pikachu");
        pikachu.setType("Electric");
        pikachu.setHeight(0.4);
        pikachu.setWeight(6.0);
        pikachu.setHp(35);
        pikachu.setAttack(55);
        pikachu.setDefense(40);
        pikachu.setSpeed(90);
        pikachu.setCaught(false);
        pikachu.setFavorite(false);
        pikachu.setLegendary(false);
    }

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAll returns list ordered by pokemonNumber")
    void getAll_returnsOrderedList() {
        when(repository.findAllByOrderByPokemonNumberAsc()).thenReturn(List.of(pikachu));

        List<Pokemon> result = service.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Pikachu");
        verify(repository).findAllByOrderByPokemonNumberAsc();
    }

    // ── getByIdOrThrow ────────────────────────────────────────────────────────

    @Test
    @DisplayName("getByIdOrThrow returns Pokémon when found")
    void getByIdOrThrow_found_returnsPokemon() {
        when(repository.findById(1L)).thenReturn(Optional.of(pikachu));

        Pokemon result = service.getByIdOrThrow(1L);

        assertThat(result.getName()).isEqualTo("Pikachu");
    }

    @Test
    @DisplayName("getByIdOrThrow throws ResourceNotFoundException when not found")
    void getByIdOrThrow_notFound_throwsException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByIdOrThrow(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");
    }

    // ── add ───────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("add saves and returns the new Pokémon")
    void add_savesPokemon() {
        when(repository.save(pikachu)).thenReturn(pikachu);

        Pokemon result = service.add(pikachu);

        assertThat(result.getName()).isEqualTo("Pikachu");
        verify(repository, times(1)).save(pikachu);
    }

    // ── toggleCaught ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleCaught flips false → true")
    void toggleCaught_false_becomesTrue() {
        pikachu.setCaught(false);
        when(repository.findById(1L)).thenReturn(Optional.of(pikachu));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pokemon result = service.toggleCaught(1L);

        assertThat(result.isCaught()).isTrue();
    }

    @Test
    @DisplayName("toggleCaught flips true → false")
    void toggleCaught_true_becomesFalse() {
        pikachu.setCaught(true);
        when(repository.findById(1L)).thenReturn(Optional.of(pikachu));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pokemon result = service.toggleCaught(1L);

        assertThat(result.isCaught()).isFalse();
    }

    @Test
    @DisplayName("toggleCaught throws ResourceNotFoundException for unknown id")
    void toggleCaught_notFound_throws() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.toggleCaught(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── toggleFavorite ────────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleFavorite flips false → true")
    void toggleFavorite_false_becomesTrue() {
        pikachu.setFavorite(false);
        when(repository.findById(1L)).thenReturn(Optional.of(pikachu));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pokemon result = service.toggleFavorite(1L);

        assertThat(result.isFavorite()).isTrue();
    }

    // ── toggleLegendary ───────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleLegendary flips false → true")
    void toggleLegendary_false_becomesTrue() {
        pikachu.setLegendary(false);
        when(repository.findById(1L)).thenReturn(Optional.of(pikachu));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pokemon result = service.toggleLegendary(1L);

        assertThat(result.isLegendary()).isTrue();
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("delete removes Pokémon when exists")
    void delete_existingId_deletesSuccessfully() {
        when(repository.existsById(1L)).thenReturn(true);

        service.delete(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    @DisplayName("delete throws ResourceNotFoundException when not found")
    void delete_notFound_throwsException() {
        when(repository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.delete(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("999");

        verify(repository, never()).deleteById(any());
    }

    // ── count queries ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getCaughtCount uses efficient count query")
    void getCaughtCount_usesCountQuery() {
        when(repository.countByCaughtTrue()).thenReturn(42L);

        long result = service.getCaughtCount();

        assertThat(result).isEqualTo(42L);
        verify(repository).countByCaughtTrue();
        // ensure it does NOT load the full list
        verify(repository, never()).findByCaughtTrue();
    }

    @Test
    @DisplayName("getFavoriteCount uses efficient count query")
    void getFavoriteCount_usesCountQuery() {
        when(repository.countByFavoriteTrue()).thenReturn(7L);

        long result = service.getFavoriteCount();

        assertThat(result).isEqualTo(7L);
        verify(repository).countByFavoriteTrue();
        verify(repository, never()).findByFavoriteTrue();
    }

    // ── searchByName ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("searchByName delegates to repository")
    void searchByName_returnsMatchingList() {
        when(repository.findByNameContainingIgnoreCase("pika"))
                .thenReturn(List.of(pikachu));

        List<Pokemon> result = service.searchByName("pika");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Pikachu");
    }
}