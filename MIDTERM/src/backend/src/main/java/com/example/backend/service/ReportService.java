package com.example.backend.service;

import com.example.backend.dto.ReportDTO;

import java.time.LocalDateTime;

public interface ReportService {
    /**
     * Lấy báo cáo tổng quan dựa trên khoảng thời gian
     *
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Báo cáo tổng quan
     */
    ReportDTO getReport(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Lấy báo cáo cho hôm nay
     *
     * @return Báo cáo tổng quan cho hôm nay
     */
    ReportDTO getReportForToday();
    
    /**
     * Lấy báo cáo cho hôm qua
     *
     * @return Báo cáo tổng quan cho hôm qua
     */
    ReportDTO getReportForYesterday();
    
    /**
     * Lấy báo cáo cho 7 ngày qua
     *
     * @return Báo cáo tổng quan cho 7 ngày qua
     */
    ReportDTO getReportForLast7Days();
    
    /**
     * Lấy báo cáo cho tháng hiện tại
     *
     * @return Báo cáo tổng quan cho tháng hiện tại
     */
    ReportDTO getReportForCurrentMonth();
} 