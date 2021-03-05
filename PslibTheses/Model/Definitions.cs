using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Model
{
    public static class Definitions
    {
        public const string THESES_AUTHOR_CLAIM = "theses_author";
        public const string THESES_EVALUATOR_CLAIM = "theses_evaluator";
        public const string THESES_MANAGER_CLAIM = "theses_manager";
        public const string THESES_ADMIN_CLAIM = "theses_admin";
        public const string THESES_ROBOT_CLAIM = "theses_robot";

        public static readonly Dictionary<WorkState, List<WorkState>> StateTransitions = new Dictionary<WorkState, List<WorkState>>
        {
            { WorkState.InPreparation, new List<WorkState> {WorkState.WorkedOut} },
            { WorkState.WorkedOut, new List<WorkState> {WorkState.Completed, WorkState.Failed} },
            { WorkState.Completed, new List<WorkState> {WorkState.Undefended, WorkState.Succesful} },
            { WorkState.Failed, new List<WorkState> {} },
            { WorkState.Succesful, new List<WorkState> {} },
            { WorkState.Undefended, new List<WorkState> {} }
        };
    }
}
