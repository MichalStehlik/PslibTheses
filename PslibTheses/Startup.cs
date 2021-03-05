using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PslibTheses.Data;
using PslibTheses.Model;
using Serilog;

namespace PslibTheses
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ThesesContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")
                )
            );
            services.AddControllersWithViews();
            services.AddAuthorization(options =>
            {
                options.AddPolicy("Logged", policy =>
                {
                    policy.RequireAuthenticatedUser();
                });
                options.AddPolicy("Administrator", policy =>
                {
                    policy.RequireAssertion(context => (context.User.HasClaim(c => c.Type == Definitions.THESES_ADMIN_CLAIM && c.Value == "1") || context.User.HasClaim(c => c.Type == Definitions.THESES_ROBOT_CLAIM && c.Value == "1")));
                });
                options.AddPolicy("AdministratorOrManagerOrEvaluator", policy =>
                {
                    policy.RequireAssertion(context => (context.User.HasClaim(c => c.Type == Definitions.THESES_ADMIN_CLAIM && c.Value == "1") || context.User.HasClaim(c => c.Type == Definitions.THESES_MANAGER_CLAIM && c.Value == "1") || context.User.HasClaim(c => c.Type == Definitions.THESES_EVALUATOR_CLAIM && c.Value == "1")));
                });
                options.AddPolicy("Author", policy =>
                {
                    policy.RequireClaim(Definitions.THESES_AUTHOR_CLAIM, "1");
                });
                options.AddPolicy("Evaluator", policy =>
                {
                    policy.RequireClaim(Definitions.THESES_EVALUATOR_CLAIM, "1");
                });
                options.AddPolicy("AuthorOrEvaluator", policy =>
                {
                    policy.RequireAssertion(context => (context.User.HasClaim(c => c.Type == Definitions.THESES_AUTHOR_CLAIM && c.Value == "1") || context.User.HasClaim(c => c.Type == Definitions.THESES_EVALUATOR_CLAIM && c.Value == "1")));
                });
                options.AddPolicy("Manager", policy =>
                {
                    policy.RequireClaim(Definitions.THESES_MANAGER_CLAIM, "1");
                });
            });
            services.AddAuthentication("Bearer").AddJwtBearer("Bearer", options =>
            {
                options.Authority = Configuration["Authority:Server"];
                options.RequireHttpsMetadata = true;
                options.Audience = "ThesesApi";
            }
            );
            services.AddCors(options =>
            {
                // this defines a CORS policy called "default"
                options.AddPolicy("default", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.UseSerilogRequestLogging();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors("default");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
