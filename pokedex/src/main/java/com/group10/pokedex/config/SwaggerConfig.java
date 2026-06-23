package com.group10.pokedex.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI pokedexOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Pokédex REST API")
                        .description(
                                "Spring Boot Pokédex — Full CRUD + Trainer features. " +
                                        "Supports search, filter by type, compare, favorites, caught, and legendary tracking. "
                                        +
                                        "Generation I (151 Pokémon).")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Group 10")
                                .email("group10@pokedex.dev")));
    }
}