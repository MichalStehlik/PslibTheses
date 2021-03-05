using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public class SearchResult
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public SearchResultType Type { get; set; }
        public string SearchedTerm { get; set; }
    }

    public enum SearchResultType
    {
        Idea = 0,
        Work = 1,
        User = 2,
        Set = 3
    }
}
