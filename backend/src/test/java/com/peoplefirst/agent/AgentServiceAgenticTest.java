package com.peoplefirst.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.peoplefirst.agent.client.GenAiClient;
import com.peoplefirst.agent.dto.AgentChatRequestDto;
import com.peoplefirst.agent.dto.AgentChatResponseDto;
import com.peoplefirst.agent.intent.IntentParser;
import com.peoplefirst.agent.service.AgentService;
import com.peoplefirst.approval.service.ApprovalService;
import com.peoplefirst.auth.security.CurrentUserProvider;
import com.peoplefirst.leave.dto.LeaveBalanceDto;
import com.peoplefirst.leave.dto.LeaveResponseDto;
import com.peoplefirst.leave.entity.LeaveBalance;
import com.peoplefirst.leave.entity.LeaveStatus;
import com.peoplefirst.leave.mapper.LeaveMapper;
import com.peoplefirst.leave.service.LeaveBalanceService;
import com.peoplefirst.leave.service.LeaveService;
import com.peoplefirst.policy.entity.LeaveType;
import com.peoplefirst.policy.service.PolicyService;
import com.peoplefirst.ticket.service.TicketService;
import com.peoplefirst.user.entity.Role;
import com.peoplefirst.user.entity.User;
import com.peoplefirst.user.service.UserService;
import com.peoplefirst.wellbeing.service.WellbeingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AgentServiceAgenticTest {

    private GenAiClient genAiClient;
    private CurrentUserProvider currentUserProvider;
    private LeaveService leaveService;
    private LeaveBalanceService leaveBalanceService;
    private LeaveMapper leaveMapper;
    private ApprovalService approvalService;
    private AgentService agentService;
    private User employee;

    @BeforeEach
    void setUp() {
        IntentParser intentParser = new IntentParser();
        currentUserProvider = Mockito.mock(CurrentUserProvider.class);
        leaveService = Mockito.mock(LeaveService.class);
        leaveBalanceService = Mockito.mock(LeaveBalanceService.class);
        PolicyService policyService = Mockito.mock(PolicyService.class);
        WellbeingService wellbeingService = Mockito.mock(WellbeingService.class);
        leaveMapper = Mockito.mock(LeaveMapper.class);
        genAiClient = Mockito.mock(GenAiClient.class);
        approvalService = Mockito.mock(ApprovalService.class);
        TicketService ticketService = Mockito.mock(TicketService.class);
        UserService userService = Mockito.mock(UserService.class);

        agentService = new AgentService(intentParser, currentUserProvider, leaveService,
                leaveBalanceService, policyService, wellbeingService, leaveMapper, genAiClient,
                approvalService, ticketService, userService);

        employee = new User("emp1", "emp1@test.com", "encodedPass", "Test Employee",
                Role.EMPLOYEE, false, "Eng", "Bangalore", UUID.randomUUID());
        employee.setId(UUID.randomUUID());
        when(currentUserProvider.getCurrentUser()).thenReturn(employee);
        when(genAiClient.isConfigured()).thenReturn(true);
    }

    @Test
    void balanceQuestionUsesToolAndKeepsDtoContract() throws Exception {
        LeaveBalance balance = Mockito.mock(LeaveBalance.class);
        when(balance.getLeaveType()).thenReturn(LeaveType.SICK);
        when(balance.getRemainingDays()).thenReturn(14.0);
        when(balance.getUsedDays()).thenReturn(2.0);
        when(balance.getPendingDays()).thenReturn(0.0);
        when(balance.getAllocatedDays()).thenReturn(16.0);
        when(leaveBalanceService.getUserBalances(eq(employee.getId()), anyInt()))
                .thenReturn(List.of(balance));
        when(leaveMapper.toBalanceDto(eq(balance), eq(employee)))
                .thenReturn(Mockito.mock(LeaveBalanceDto.class));
        String toolCall = "{\"content\": null, \"tool_calls\": [{\"id\": \"c1\", \"type\": \"function\", "
                + "\"function\": {\"name\": \"check_balance\", \"arguments\": \"{}\"}`]}".replace('`', '}');
        String finalReply = "{\"content\": \"You have 14 sick days left.\", \"tool_calls\": []}";
        when(genAiClient.chatWithTools(anyString(), anyList(), anyList()))
                .thenReturn(Optional.of(toolCall), Optional.of(finalReply));

        AgentChatRequestDto request = new AgentChatRequestDto("how many sick days do I have left?", "test-conv-1");
        AgentChatResponseDto response = agentService.processMessage(request);

        assertTrue(response.isActionExecuted());
        assertEquals("CHECK_BALANCE", response.getActionName());
        assertNotNull(response.getActionData());
        assertNotNull(response.getReply());
        assertNotNull(response.getQuickReplies());
    }

    @Test
    void unconfiguredClientKeepsRuleBasedReply() {
        when(genAiClient.isConfigured()).thenReturn(false);
        AgentChatRequestDto request = new AgentChatRequestDto("hello", "test-conv-2");
        AgentChatResponseDto response = agentService.processMessage(request);
        assertTrue(response.getReply().contains("Kura"));
    }

    @Test
    void statusReportsAgenticModeWithoutLeakingSecrets() {
        when(genAiClient.isConfigured()).thenReturn(true);
        Map<String, Object> status = agentService.getAgentStatus();
        assertEquals("agentic", status.get("agentMode"));
        assertFalse(status.values().stream().anyMatch(v -> "test-key-not-sk".equals(v)));
    }

    @Test
    void statusReportsRuleBasedWhenUnconfigured() {
        when(genAiClient.isConfigured()).thenReturn(false);
        Map<String, Object> status = agentService.getAgentStatus();
        assertEquals("rule-based", status.get("agentMode"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void historyIsScopedPerUserForSameConversationId() {
        LeaveBalance balance = Mockito.mock(LeaveBalance.class);
        when(balance.getLeaveType()).thenReturn(LeaveType.SICK);
        when(balance.getRemainingDays()).thenReturn(14.0);
        when(balance.getUsedDays()).thenReturn(2.0);
        when(balance.getPendingDays()).thenReturn(0.0);
        when(balance.getAllocatedDays()).thenReturn(16.0);
        when(leaveBalanceService.getUserBalances(eq(employee.getId()), anyInt()))
                .thenReturn(List.of(balance));
        when(leaveMapper.toBalanceDto(eq(balance), eq(employee)))
                .thenReturn(Mockito.mock(LeaveBalanceDto.class));
        String toolCall = "{\"content\": null, \"tool_calls\": [{\"id\": \"c1\", \"type\": \"function\", "
                + "\"function\": {\"name\": \"check_balance\", \"arguments\": \"{}\"}`]}".replace('`', '}');
        String finalReply = "{\"content\": \"done.\", \"tool_calls\": []}";
        when(genAiClient.chatWithTools(anyString(), anyList(), anyList()))
                .thenReturn(Optional.of(toolCall), Optional.of(finalReply));

        String userAMessage = "how many sick days left for alpha-user-seven?";
        agentService.processMessage(new AgentChatRequestDto(userAMessage, "shared-conv"));

        User userB = new User("emp2", "emp2@test.com", "encodedPass", "Second User",
                Role.EMPLOYEE, false, "Eng", "Bangalore", UUID.randomUUID());
        userB.setId(UUID.randomUUID());
        when(currentUserProvider.getCurrentUser()).thenReturn(userB);
        agentService.processMessage(new AgentChatRequestDto("hello", "shared-conv"));

        ArgumentCaptor<List<Map<String, String>>> historyCaptor = ArgumentCaptor.forClass(List.class);
        Mockito.verify(genAiClient, Mockito.atLeastOnce())
                .chatWithTools(anyString(), historyCaptor.capture(), anyList());
        List<List<Map<String, String>>> allHistories = historyCaptor.getAllValues();
        List<Map<String, String>> lastHistory = allHistories.get(allHistories.size() - 1);
        assertTrue(lastHistory.stream()
                        .map(m -> m.get("content"))
                        .filter(c -> c != null)
                        .noneMatch(c -> c.contains("alpha-user-seven")),
                "User B history must not contain User A message text");
    }

    private String applyLeaveToolCall() {
        String args = "{\\\"leaveType\\\":\\\"SICK\\\",\\\"startDate\\\":\\\"2030-01-06\\\","
                + "\\\"endDate\\\":\\\"2030-01-07\\\",\\\"reason\\\":\\\"test via agent\\\"}";
        return "{\"content\": null, \"tool_calls\": [{\"id\": \"c1\", \"type\": \"function\", "
                + "\"function\": {\"name\": \"apply_leave\", \"arguments\": \"" + args + "\"}}]}";
    }

    private void stubApplyLeaveExecution() {
        LeaveResponseDto created = Mockito.mock(LeaveResponseDto.class);
        when(created.getLeaveTypeDisplayName()).thenReturn("Sick Leave");
        when(created.getStartDate()).thenReturn(LocalDate.of(2030, 1, 6));
        when(created.getEndDate()).thenReturn(LocalDate.of(2030, 1, 7));
        when(leaveService.applyLeave(any(), any())).thenReturn(created);
    }

    @Test
    void yesterdayPrefixedMessageDoesNotConfirmPendingApply() {
        when(genAiClient.chatWithTools(anyString(), anyList(), anyList()))
                .thenReturn(Optional.of(applyLeaveToolCall()));
        stubApplyLeaveExecution();

        AgentChatResponseDto proposal = agentService.processMessage(
                new AgentChatRequestDto("i want to apply for leave", "conv-confirm-a"));
        assertFalse(proposal.isActionExecuted());

        // The old gate over-triggered on "yesterday…" via startsWith("yes"); must NOT confirm.
        AgentChatResponseDto afterYesterday = agentService.processMessage(
                new AgentChatRequestDto("yesterday we leave for a trip", "conv-confirm-a"));
        // The brief's literal substring case must also not resolve the gate.
        AgentChatResponseDto afterLiteral = agentService.processMessage(
                new AgentChatRequestDto("we leave yesterday", "conv-confirm-a"));
        Mockito.verify(leaveService, Mockito.never()).applyLeave(any(), any());
        assertFalse(afterYesterday.isActionExecuted());
        assertFalse(afterLiteral.isActionExecuted());
    }

    @Test
    void notSureDoesNotDiscardPendingApplyAndYesStillExecutes() {
        when(genAiClient.chatWithTools(anyString(), anyList(), anyList()))
                .thenReturn(Optional.of(applyLeaveToolCall()));
        stubApplyLeaveExecution();

        agentService.processMessage(new AgentChatRequestDto("i want to apply for leave", "conv-confirm-b"));
        // The old gate discarded on "not sure…" via startsWith("no"); must NOT discard.
        agentService.processMessage(new AgentChatRequestDto("not sure about that", "conv-confirm-b"));
        Mockito.verify(leaveService, Mockito.never()).applyLeave(any(), any());

        AgentChatResponseDto confirmed = agentService.processMessage(
                new AgentChatRequestDto("yes", "conv-confirm-b"));
        assertTrue(confirmed.isActionExecuted());
        Mockito.verify(leaveService, Mockito.times(1)).applyLeave(any(), eq(employee));
    }

    @Test
    void yesExecutesPendingCancelLeave() {
        String cancelToolCall = "{\"content\": null, \"tool_calls\": [{\"id\": \"c1\", \"type\": \"function\", "
                + "\"function\": {\"name\": \"cancel_leave\", \"arguments\": \"{}\"}`]}".replace('`', '}');
        when(genAiClient.chatWithTools(anyString(), anyList(), anyList()))
                .thenReturn(Optional.of(cancelToolCall));

        LeaveResponseDto upcoming = Mockito.mock(LeaveResponseDto.class);
        when(upcoming.getId()).thenReturn(UUID.randomUUID());
        when(upcoming.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(upcoming.getStartDate()).thenReturn(LocalDate.now().plusDays(5));
        when(upcoming.getEndDate()).thenReturn(LocalDate.now().plusDays(6));
        when(leaveService.getLeavesForUser(eq(employee.getId()))).thenReturn(List.of(upcoming));
        LeaveResponseDto cancelled = Mockito.mock(LeaveResponseDto.class);
        when(cancelled.getLeaveTypeDisplayName()).thenReturn("Sick Leave");
        when(cancelled.getStartDate()).thenReturn(LocalDate.now().plusDays(5));
        when(cancelled.getEndDate()).thenReturn(LocalDate.now().plusDays(6));
        when(leaveService.cancelLeave(any(), any(), any())).thenReturn(cancelled);

        agentService.processMessage(new AgentChatRequestDto("cancel my upcoming leave", "conv-confirm-c"));
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("yes", "conv-confirm-c"));
        Mockito.verify(leaveService, Mockito.times(1)).cancelLeave(any(), eq(employee), anyString());
        assertTrue(response.isActionExecuted());
    }

    @Test
    void overlongMessageIsRefusedWithoutLlmCost() {
        when(genAiClient.isConfigured()).thenReturn(true);
        String longMessage = "x".repeat(2001);
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto(longMessage, "conv-limit-a"));
        assertTrue(response.getReply().contains("2000"));
        assertFalse(response.isActionExecuted());
        Mockito.verifyNoInteractions(genAiClient);
    }

    @Test
    void exactly2000CharsStillGetsRuleGreeting() {
        when(genAiClient.isConfigured()).thenReturn(false);
        String message = "hello" + "x".repeat(1995);
        assertEquals(2000, message.length());
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto(message, "conv-limit-b"));
        assertTrue(response.getReply().contains("Kura"));
    }

    @Test
    void managerApproveWithTypoAndEmployeeNameResolvesAndApproves() {
        when(genAiClient.isConfigured()).thenReturn(false);
        User manager = new User("mgr1", "mgr1@test.com", "hash", "Vikram Manager",
                Role.MANAGER, false, "Eng", "Bangalore", null, com.peoplefirst.user.entity.Gender.MALE);
        manager.setId(UUID.randomUUID());
        when(currentUserProvider.getCurrentUser()).thenReturn(manager);

        LeaveResponseDto pendingRohan = Mockito.mock(LeaveResponseDto.class);
        UUID rohanLeaveId = UUID.randomUUID();
        when(pendingRohan.getId()).thenReturn(rohanLeaveId);
        when(pendingRohan.getEmployeeName()).thenReturn("Rohan Verma");
        when(pendingRohan.getLeaveTypeDisplayName()).thenReturn("Sick Leave");
        when(pendingRohan.getStartDate()).thenReturn(LocalDate.now().plusDays(2));
        when(pendingRohan.getEndDate()).thenReturn(LocalDate.now().plusDays(3));

        when(approvalService.getPendingApprovals(eq(manager))).thenReturn(List.of(pendingRohan));

        LeaveResponseDto approved = Mockito.mock(LeaveResponseDto.class);
        when(approved.getId()).thenReturn(rohanLeaveId);
        when(approved.getEmployeeName()).thenReturn("Rohan Verma");
        when(approved.getLeaveTypeDisplayName()).thenReturn("Sick Leave");
        when(approved.getStartDate()).thenReturn(LocalDate.now().plusDays(2));
        when(approved.getEndDate()).thenReturn(LocalDate.now().plusDays(3));
        when(approvalService.approveLeave(eq(rohanLeaveId), any(), eq(manager))).thenReturn(approved);

        // Typo: "aprove rohan"
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("aprove rohan", "conv-mgr-1"));
        assertTrue(response.isActionExecuted());
        assertEquals("APPROVE_LEAVE", response.getActionName());
        assertTrue(response.getReply().contains("Rohan Verma"));
        assertTrue(response.getReply().contains("APPROVED"));
    }

    @Test
    void managerRejectWithTypoAndSendBackWithTypo() {
        when(genAiClient.isConfigured()).thenReturn(false);
        User manager = new User("mgr1", "mgr1@test.com", "hash", "Vikram Manager",
                Role.MANAGER, false, "Eng", "Bangalore", null, com.peoplefirst.user.entity.Gender.MALE);
        manager.setId(UUID.randomUUID());
        when(currentUserProvider.getCurrentUser()).thenReturn(manager);

        LeaveResponseDto pending = Mockito.mock(LeaveResponseDto.class);
        UUID leaveId = UUID.randomUUID();
        when(pending.getId()).thenReturn(leaveId);
        when(pending.getEmployeeName()).thenReturn("Ananya Gupta");
        when(pending.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(approvalService.getPendingApprovals(eq(manager))).thenReturn(List.of(pending));

        LeaveResponseDto rejected = Mockito.mock(LeaveResponseDto.class);
        when(rejected.getId()).thenReturn(leaveId);
        when(rejected.getEmployeeName()).thenReturn("Ananya Gupta");
        when(rejected.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(approvalService.rejectLeave(eq(leaveId), any(), eq(manager))).thenReturn(rejected);

        // Typo: "rejct ananya because overlap"
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("rejct ananya because overlap", "conv-mgr-2"));
        assertTrue(response.isActionExecuted());
        assertEquals("REJECT_LEAVE", response.getActionName());
        assertTrue(response.getReply().contains("REJECTED"));
    }

    @Test
    void managerCanAskWhoIsOnLeaveScopedToDepartment() {
        when(genAiClient.isConfigured()).thenReturn(false);
        User manager = new User("mgr1", "mgr1@test.com", "hash", "Vikram Manager",
                Role.MANAGER, false, "Engineering", "Bangalore", null, com.peoplefirst.user.entity.Gender.MALE);
        manager.setId(UUID.randomUUID());
        when(currentUserProvider.getCurrentUser()).thenReturn(manager);

        LeaveResponseDto leave = Mockito.mock(LeaveResponseDto.class);
        when(leave.getEmployeeName()).thenReturn("Rohan Verma");
        when(leave.getDepartment()).thenReturn("Engineering");
        when(leave.getLeaveTypeDisplayName()).thenReturn("Sick Leave");
        when(leave.getStartDate()).thenReturn(LocalDate.now());
        when(leave.getEndDate()).thenReturn(LocalDate.now().plusDays(2));
        when(leave.isHalfDay()).thenReturn(false);

        when(leaveService.getEmployeesOnLeave(eq(LocalDate.now()), eq("Engineering"), eq(manager)))
                .thenReturn(List.of(leave));

        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("who is on leave today", "conv-on-leave-1"));
        assertTrue(response.isActionExecuted());
        assertEquals("VIEW_ON_LEAVE", response.getActionName());
        assertTrue(response.getReply().contains("Rohan Verma"));
        assertTrue(response.getReply().contains("Engineering"));
    }

    @Test
    void employeeAskingWhoIsOnLeaveIsDenied() {
        when(genAiClient.isConfigured()).thenReturn(false);
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("who is on leave", "conv-on-leave-2"));
        assertFalse(response.isActionExecuted());
        assertTrue(response.getReply().contains("Managers") && response.getReply().contains("Administrators"));
    }

    @Test
    void applyLeaveOnWeekendIsDetectedAndRejectedImmediately() {
        when(genAiClient.isConfigured()).thenReturn(false);
        // Next Sunday date
        LocalDate nextSunday = LocalDate.now();
        while (nextSunday.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
            nextSunday = nextSunday.plusDays(1);
        }

        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("apply casual leave on " + nextSunday, "conv-wknd-1"));
        assertFalse(response.isActionExecuted());
        assertTrue(response.getReply().contains("weekend") || response.getReply().contains("Sunday"));
        assertTrue(response.getReply().contains("Monday to Friday"));
    }

    @Test
    void applyLeaveWithInlineReasonIsExecutedInSingleTurn() {
        when(genAiClient.isConfigured()).thenReturn(false);
        stubApplyLeaveExecution();
        // Next Monday date
        LocalDate nextMonday = LocalDate.now();
        while (nextMonday.getDayOfWeek() != java.time.DayOfWeek.MONDAY) {
            nextMonday = nextMonday.plusDays(1);
        }

        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("apply leave " + nextMonday + " casual reason personal", "conv-reason-1"));
        assertTrue(response.isActionExecuted());
        assertTrue(response.getReply().contains("Leave Request Submitted Successfully"));
    }

    @Test
    void applyLeaveOnDateWithOverlapFlagsConflictImmediatelyWithoutPromptingLeaveType() {
        when(genAiClient.isConfigured()).thenReturn(false);
        LocalDate targetDate = LocalDate.of(2026, 9, 9);
        LeaveResponseDto existingLeave = Mockito.mock(LeaveResponseDto.class);
        when(existingLeave.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(existingLeave.getStartDate()).thenReturn(LocalDate.of(2026, 9, 7));
        when(existingLeave.getEndDate()).thenReturn(LocalDate.of(2026, 9, 10));
        when(existingLeave.getLeaveType()).thenReturn(LeaveType.SICK);
        when(leaveService.getLeavesForUser(employee.getId())).thenReturn(List.of(existingLeave));

        // User says "apply for a leave on 2026-09-09" without specifying leave type
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("apply for a leave on " + targetDate, "conv-overlap-immediate"));

        assertFalse(response.isActionExecuted());
        assertTrue(response.getReply().contains("Overlapping leave requests on the same date are not permitted"));
        assertTrue(response.getReply().contains("Sick Leave"));
        assertFalse(response.getReply().contains("Which type of leave would you like to apply for?"));
    }

    @Test
    void applyLeaveOnWeekendFlagsWeekendImmediately() {
        when(genAiClient.isConfigured()).thenReturn(false);
        LocalDate nextSunday = LocalDate.now();
        while (nextSunday.getDayOfWeek() != java.time.DayOfWeek.SUNDAY) {
            nextSunday = nextSunday.plusDays(1);
        }

        // User says "apply casual leave on Sunday"
        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("apply casual leave on " + nextSunday, "conv-wknd-immediate"));

        assertFalse(response.isActionExecuted());
        assertTrue(response.getReply().contains("weekend") || response.getReply().contains("Sunday"));
    }

    @Test
    void editLeaveWithTypoAndFromToDatesIsExecutedSuccessfully() {
        when(genAiClient.isConfigured()).thenReturn(false);
        UUID leaveId = UUID.randomUUID();
        LeaveResponseDto existing = Mockito.mock(LeaveResponseDto.class);
        when(existing.getId()).thenReturn(leaveId);
        when(existing.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(existing.getStartDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(existing.getEndDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(existing.getLeaveType()).thenReturn(LeaveType.CASUAL);
        when(existing.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(existing.getReason()).thenReturn("Personal work");
        when(leaveService.getLeavesForUser(employee.getId())).thenReturn(List.of(existing));

        LeaveResponseDto updated = Mockito.mock(LeaveResponseDto.class);
        when(updated.getId()).thenReturn(leaveId);
        when(updated.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(updated.getStartDate()).thenReturn(LocalDate.of(2026, 9, 11));
        when(updated.getEndDate()).thenReturn(LocalDate.of(2026, 9, 11));
        when(updated.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(updated.getReason()).thenReturn("Personal work");
        when(updated.getTotalDays()).thenReturn(1.0);
        when(leaveService.editLeave(eq(leaveId), any(), any())).thenReturn(updated);

        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("i want to chnage my casual leave from 21st to 11th", "conv-edit-typo"));

        assertTrue(response.isActionExecuted());
        assertEquals("EDIT_LEAVE", response.getActionName());
        assertTrue(response.getReply().contains("Leave Request Updated Successfully"));
    }

    @Test
    void editLeaveFromDayNumberToDayNumberShiftsSingleDayLeave() {
        when(genAiClient.isConfigured()).thenReturn(false);
        UUID leaveId = UUID.randomUUID();
        LeaveResponseDto existing = Mockito.mock(LeaveResponseDto.class);
        when(existing.getId()).thenReturn(leaveId);
        when(existing.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(existing.getStartDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(existing.getEndDate()).thenReturn(LocalDate.of(2026, 9, 21));
        when(existing.getLeaveType()).thenReturn(LeaveType.CASUAL);
        when(existing.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(existing.getReason()).thenReturn("Personal work");
        when(leaveService.getLeavesForUser(employee.getId())).thenReturn(List.of(existing));

        LeaveResponseDto updated = Mockito.mock(LeaveResponseDto.class);
        when(updated.getId()).thenReturn(leaveId);
        when(updated.getStatus()).thenReturn(LeaveStatus.PENDING);
        when(updated.getStartDate()).thenReturn(LocalDate.of(2026, 9, 22));
        when(updated.getEndDate()).thenReturn(LocalDate.of(2026, 9, 22));
        when(updated.getLeaveTypeDisplayName()).thenReturn("Casual Leave");
        when(updated.getReason()).thenReturn("Personal work");
        when(updated.getTotalDays()).thenReturn(1.0);
        when(leaveService.editLeave(eq(leaveId), any(), any())).thenReturn(updated);

        AgentChatResponseDto response = agentService.processMessage(
                new AgentChatRequestDto("change casual leave date from 21 to 22", "conv-edit-num"));

        assertTrue(response.isActionExecuted());
        assertEquals("EDIT_LEAVE", response.getActionName());
        assertTrue(response.getReply().contains("Leave Request Updated Successfully"));
        assertTrue(response.getReply().contains("2026-09-22 to 2026-09-22 (1.0 day)"));
    }
}

