package com.peoplefirst.leave.repository;

import com.peoplefirst.leave.entity.LeaveRequest;
import com.peoplefirst.leave.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<LeaveRequest> findByUserIdInOrderByCreatedAtDesc(List<UUID> userIds);
    List<LeaveRequest> findByUserIdAndStatus(UUID userId, LeaveStatus status);
    List<LeaveRequest> findByUserIdAndStatusIn(UUID userId, List<LeaveStatus> statuses);
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
    List<LeaveRequest> findByUserIdAndStartDateAfter(UUID userId, LocalDate date);
    List<LeaveRequest> findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(LeaveStatus status, LocalDate date1, LocalDate date2);
    List<LeaveRequest> findByStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(List<LeaveStatus> statuses, LocalDate date1, LocalDate date2);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByStatusIn(List<LeaveStatus> statuses);
}
