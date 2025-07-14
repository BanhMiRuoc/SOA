package com.example.backend.controller;

import com.example.backend.dto.DateRangeRequest;
import com.example.backend.dto.ReportDTO;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('MANAGER', 'CASHIER')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/today")
    public ResponseEntity<ReportDTO> getTodayReport() {
        return ResponseEntity.ok(reportService.getReportForToday());
    }

    @GetMapping("/yesterday")
    public ResponseEntity<ReportDTO> getYesterdayReport() {
        return ResponseEntity.ok(reportService.getReportForYesterday());
    }

    @GetMapping("/last7days")
    public ResponseEntity<ReportDTO> getLast7DaysReport() {
        return ResponseEntity.ok(reportService.getReportForLast7Days());
    }

    @GetMapping("/this-month")
    public ResponseEntity<ReportDTO> getCurrentMonthReport() {
        return ResponseEntity.ok(reportService.getReportForCurrentMonth());
    }
    
    @GetMapping("/last-month")
    public ResponseEntity<ReportDTO> getLastMonthReport() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayOfLastMonth = firstDayOfLastMonth.with(TemporalAdjusters.lastDayOfMonth());
        
        LocalDateTime startOfMonth = firstDayOfLastMonth.atStartOfDay();
        LocalDateTime endOfMonth = lastDayOfLastMonth.atTime(23, 59, 59);
        
        return ResponseEntity.ok(reportService.getReport(startOfMonth, endOfMonth));
    }
    
    @GetMapping("/quarter")
    public ResponseEntity<ReportDTO> getQuarterReport(@RequestParam int quarter, @RequestParam int year) {
        if (quarter < 1 || quarter > 4) {
            throw new IllegalArgumentException("Quarter must be between 1 and 4");
        }
        
        LocalDate startDate = LocalDate.of(year, (quarter - 1) * 3 + 1, 1);
        LocalDate endDate = LocalDate.of(year, quarter * 3, 1)
                .with(TemporalAdjusters.lastDayOfMonth());
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        return ResponseEntity.ok(reportService.getReport(startDateTime, endDateTime));
    }
    
    @GetMapping("/year")
    public ResponseEntity<ReportDTO> getYearReport(@RequestParam int year) {
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        return ResponseEntity.ok(reportService.getReport(startDateTime, endDateTime));
    }
    
    @GetMapping("/custom-range")
    public ResponseEntity<ReportDTO> getCustomRangeReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(23, 59, 59);
        
        return ResponseEntity.ok(reportService.getReport(startDateTime, endDateTime));
    }

    @PostMapping("/date-range")
    public ResponseEntity<ReportDTO> getReportByDateRange(@RequestBody DateRangeRequest request) {
        return ResponseEntity.ok(reportService.getReport(request.getStartDate(), request.getEndDate()));
    }
} 