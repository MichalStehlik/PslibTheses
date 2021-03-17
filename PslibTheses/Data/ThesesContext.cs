using Microsoft.EntityFrameworkCore;
using PslibTheses.Model;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;

namespace PslibTheses.Data
{
    public class ThesesContext : DbContext
    {
        public ThesesContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Target> Targets { get; set; }
        public DbSet<Idea> Ideas { get; set; }
        public DbSet<IdeaGoal> IdeaGoals { get; set; }
        public DbSet<IdeaOutline> IdeaOutlines { get; set; }
        public DbSet<IdeaTarget> IdeaTargets { get; set; }
        public DbSet<IdeaOffer> IdeaOffers { get; set; }
        public DbSet<Set> Sets { get; set; }
        public DbSet<SetTerm> SetTerms { get; set; }
        public DbSet<SetRole> SetRoles { get; set; }
        public DbSet<SetQuestion> SetQuestions { get; set; }
        public DbSet<SetAnswer> SetAnswers { get; set; }
        public DbSet<Work> Works { get; set; }
        public DbSet<WorkGoal> WorkGoals { get; set; }
        public DbSet<WorkOutline> WorkOutlines { get; set; }
        public DbSet<WorkRole> WorkRoles { get; set; }
        public DbSet<WorkRoleUser> WorkRoleUsers { get; set; }
        public DbSet<WorkRoleQuestion> WorkRoleQuestions { get; set; }
        public DbSet<WorkEvaluation> WorkEvaluations { get; set; }
        public DbSet<WorkNote> WorkNotes { get; set; }
        public DbSet<Scale> Scales { get; set; }
        public DbSet<ScaleValue> ScaleValues { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Idea>(entity =>
            {
                entity.HasOne(i => i.User).WithMany(u => u.OwnedIdeas).HasForeignKey(i => i.UserId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<IdeaOffer>().HasKey(io => new { io.IdeaId, io.UserId });
            modelBuilder.Entity<ScaleValue>().HasKey(sv => new { sv.ScaleId, sv.Rate });
            modelBuilder.Entity<WorkEvaluation>().HasKey(we => new { we.WorkId, we.SetQuestionId });
            modelBuilder.Entity<IdeaGoal>().HasIndex(ig => new { ig.IdeaId, ig.Order }).IsUnique();
            modelBuilder.Entity<IdeaOutline>().HasIndex(io => new { io.IdeaId, io.Order }).IsUnique();
            modelBuilder.Entity<IdeaTarget>().HasIndex(it => new { it.IdeaId, it.TargetId }).IsUnique();
            modelBuilder.Entity<Work>(entity =>
            {
                entity.HasOne(w => w.User).WithMany(u => u.OwnedWorks).HasForeignKey(w => w.UserId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(w => w.Manager).WithMany(u => u.ManagedWorks).HasForeignKey(w => w.ManagerId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(w => w.Author).WithMany(u => u.AuthoredWorks).HasForeignKey(w => w.AuthorId).OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(w => w.Roles).WithOne(wr => wr.Work).HasForeignKey(w => w.WorkId).OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<SetQuestion>(entity =>
            {
                entity.HasMany(q => q.Answers).WithOne(a => a.Question).HasForeignKey(a => a.SetQuestionId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Set>(entity =>
            {
                entity.HasMany(s => s.Works).WithOne(w => w.Set).HasForeignKey(w => w.SetId).OnDelete(DeleteBehavior.Restrict);
                entity.HasMany(s => s.Terms).WithOne(t => t.Set).HasForeignKey(t => t.SetId).OnDelete(DeleteBehavior.NoAction);
                entity.HasMany(s => s.Roles).WithOne(r => r.Set).HasForeignKey(r => r.SetId).OnDelete(DeleteBehavior.NoAction); // ???
            });
            modelBuilder.Entity<WorkRoleUser>(entity =>
            {
                entity.HasOne(wru => wru.User).WithMany(u => u.WorkRoleUsers).HasForeignKey(u => u.UserId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(wru => wru.WorkRole).WithMany(wr => wr.WorkRoleUsers).HasForeignKey(wr => wr.WorkRoleId).OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Scale>(entity =>
            {
                entity.HasMany(s => s.Sets).WithOne(s => s.Scale).HasForeignKey(s => s.ScaleId).OnDelete(DeleteBehavior.Restrict);
            });

            #region IdeaTargetSeed
            modelBuilder.Entity<Target>().HasData(new Target { Id = 1, Text = "MP Lyceum", Color = Color.Yellow });
            modelBuilder.Entity<Target>().HasData(new Target { Id = 2, Text = "RP Lyceum", Color = Color.Orange });
            modelBuilder.Entity<Target>().HasData(new Target { Id = 3, Text = "MP IT", Color = Color.Red });
            modelBuilder.Entity<Target>().HasData(new Target { Id = 4, Text = "MP Strojírenství", Color = Color.Blue });
            modelBuilder.Entity<Target>().HasData(new Target { Id = 5, Text = "MP Elektrotechnika", Color = Color.Green });
            #endregion

            #region ScalesSeed
            modelBuilder.Entity<Scale>().HasData(new Scale { Id = 1, Name = "Stará škála" });
            modelBuilder.Entity<ScaleValue>().HasData(new ScaleValue { ScaleId = 1, Rate = 1, Mark = 1, Name = "Výborný" });
            modelBuilder.Entity<ScaleValue>().HasData(new ScaleValue { ScaleId = 1, Rate = 0.8, Mark = 2, Name = "Chvalitebný" });
            modelBuilder.Entity<ScaleValue>().HasData(new ScaleValue { ScaleId = 1, Rate = 0.6, Mark = 3, Name = "Dobrý" });
            modelBuilder.Entity<ScaleValue>().HasData(new ScaleValue { ScaleId = 1, Rate = 0.4, Mark = 4, Name = "Dostatečný" });
            modelBuilder.Entity<ScaleValue>().HasData(new ScaleValue { ScaleId = 1, Rate = 0.2, Mark = 5, Name = "Nedostatečný" });
            #endregion
        }
    }
}
