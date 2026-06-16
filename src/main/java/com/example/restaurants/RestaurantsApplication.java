package com.example.restaurants;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = {"com.example.restaurants.model.entity"})
public class RestaurantsApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantsApplication.class, args);
    }

}
