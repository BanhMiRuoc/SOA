package com.example.backend.repository;

import com.example.backend.model.Table;
import com.example.backend.model.enums.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<Table, Long> {
    List<Table> findByStatus(TableStatus status);
    Optional<Table> findByTableNumber(String tableNumber);
    List<Table> findByIsActiveTrue();
    List<Table> findByStatusAndIsActiveTrue(TableStatus status);
}