package com.peoplefirst.policy.entity;

import com.peoplefirst.user.entity.Gender;

public enum LeaveType {
    CASUAL("Casual Leave", 12.0, 0.0, true, false, null),
    SICK("Sick Leave", 16.0, 16.0, true, true, null),
    PAID("Paid Leave", 20.0, 24.0, true, true, null),
    LOP("Loss of Pay", 180.0, 30.0, true, true, null),
    WFH("Work From Home", 24.0, 0.0, true, false, null),
    MATERNITY("Maternity Leave", 182.0, 0.0, true, false, Gender.FEMALE),
    PATERNITY("Paternity Leave", 15.0, 0.0, true, false, Gender.MALE),
    VOLUNTEERING("Volunteering Leave", 2.0, 0.0, true, false, null);

    private final String displayName;
    private final double employeeAnnualQuota;
    private final double contractorAnnualQuota;
    private final boolean employeeEligible;
    private final boolean contractorEligible;
    private final Gender targetGender;

    LeaveType(String displayName, double employeeAnnualQuota, double contractorAnnualQuota,
              boolean employeeEligible, boolean contractorEligible, Gender targetGender) {
        this.displayName = displayName;
        this.employeeAnnualQuota = employeeAnnualQuota;
        this.contractorAnnualQuota = contractorAnnualQuota;
        this.employeeEligible = employeeEligible;
        this.contractorEligible = contractorEligible;
        this.targetGender = targetGender;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getEmployeeAnnualQuota() {
        return employeeAnnualQuota;
    }

    public double getContractorAnnualQuota() {
        return contractorAnnualQuota;
    }

    public boolean isEmployeeEligible() {
        return employeeEligible;
    }

    public boolean isContractorEligible() {
        return contractorEligible;
    }

    public Gender getTargetGender() {
        return targetGender;
    }

    public double getDefaultQuotaForUser(boolean isContractor) {
        return isContractor ? contractorAnnualQuota : employeeAnnualQuota;
    }

    public double getDefaultQuotaForUser(boolean isContractor, Gender gender) {
        if (!isEligibleForUser(isContractor, gender)) {
            return 0.0;
        }
        return isContractor ? contractorAnnualQuota : employeeAnnualQuota;
    }

    public boolean isEligibleForUser(boolean isContractor) {
        return isContractor ? contractorEligible : employeeEligible;
    }

    public boolean isEligibleForUser(boolean isContractor, Gender gender) {
        if (isContractor) {
            return contractorEligible;
        }
        if (!employeeEligible) {
            return false;
        }
        if (targetGender == null) {
            return true;
        }
        if (gender == null || gender == Gender.OTHER) {
            return true;
        }
        return targetGender == gender;
    }
}
