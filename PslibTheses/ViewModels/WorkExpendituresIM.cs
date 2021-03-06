using System.ComponentModel.DataAnnotations;

namespace PslibTheses.ViewModels
{
    public class WorkExpendituresIM
    {
        [Required]
        public int Id { get; set; }
        public int MaterialCosts { get; set; } = 0;
        public int MaterialCostsProvidedBySchool { get; set; } = 0;
        public int ServicesCosts { get; set; } = 0;
        public int ServicesCostsProvidedBySchool { get; set; } = 0;
        public string DetailExpenditures { get; set; }
    }
}
