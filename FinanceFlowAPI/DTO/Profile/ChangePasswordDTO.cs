namespace FinanceTrackerApp.DTO.Profile
{
    public class ChangePasswordDTO
    {
        public int UserId { get; set; }
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}