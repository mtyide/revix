namespace Reservations
{
    using System.Web;
    using System.Web.Optimization;
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery/dist/jquery.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery/jquery-ui/jquery-ui.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/dist").Include(
                        "~/Scripts/bootstrap/dist/js/bootstrap.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/datatables").Include(
                        "~/Scripts/datatables.net/js/jquery.dataTables.min.js",
                        "~/Scripts/datatables.net-bs/js/dataTables.bootstrap.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                        "~/Scripts/app/reservations.js",
                        "~/Scripts/app/shared.js"));

            bundles.Add(new StyleBundle("~/Content/css").
                Include("~/Scripts/bootstrap/dist/css/bootstrap.min.css",
                "~/Scripts/font-awesome/css/font-awesome.min.css",
                "~/Scripts/Ionicons/css/ionicons.min.css",
                "~/Scripts/datatables.net-bs/css/dataTables.bootstrap.min.css"));

            BundleTable.EnableOptimizations = true;
        }
    }
}