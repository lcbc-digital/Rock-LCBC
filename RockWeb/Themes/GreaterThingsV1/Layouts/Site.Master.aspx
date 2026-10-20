<%@ Master Language="C#" AutoEventWireup="true" Inherits="Rock.Web.UI.RockMasterPage" %>
<%@ Import Namespace="System.Web.Optimization" %>
<!DOCTYPE html>

<script runat="server">

    // keep code below to call base class init method

    /// <summary>
    /// Raises the <see cref="E:System.Web.UI.Control.Init" /> event.
    /// </summary>
    /// <param name="e">An <see cref="T:System.EventArgs" /> object that contains the event data.</param>
    protected override void OnInit( EventArgs e )
    {
        base.OnInit( e );
    }

</script>

<html >
<head runat="server">

    <meta charset="utf-8">
    <title></title>

    <script src="<%# System.Web.Optimization.Scripts.Url("~/Scripts/Bundles/RockJQueryLatest" ) %>"></script>

    <!-- Set the viewport width to device width for mobile -->
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

    <asp:ContentPlaceHolder ID="css" runat="server" />

	<!-- Included CSS Files -->
	<link rel="stylesheet" href="<%# ResolveRockUrl("~~/Styles/theme.css", true) %>"/>

    <!-- GSAP (deferred, animations init after DOM ready) -->
    <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>

    <!-- Custom Theme Scripts (order matters: GSAP > TT-Cascade > components) -->
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Animation/TT-Cascade.js", true) %>"></script>
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/Header.js", true) %>"></script>
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/LinkTargets.js", true) %>"></script>
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/IntroContent.js", true) %>"></script>
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/FormEntry.js", true) %>"></script>
    <script defer src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/Accordion.js", true) %>"></script>

    <!-- Strips utm_ parameters from the address bar after Rock has recorded them. Not deferred. -->
    <script src="<%# ResolveRockUrl("~~/Assets/Scripts/Components/UtmCleanup.js", true) %>"></script>

    <asp:ContentPlaceHolder ID="head" runat="server"></asp:ContentPlaceHolder>

    <Rock:Lava ID="OrgSchema" runat="server">
        {% include '~~/Assets/Lava/Custom/Common/Schema/OrganizationSchema.lava' %}
    </Rock:Lava>

    <Rock:Lava ID="PageMeta" runat="server">
        {% include '~~/Assets/Lava/Custom/Common/PageMetadata.lava' %}
    </Rock:Lava>

</head>
<body runat="server" id="body">

    <form id="form1" runat="server">

        <!-- Header -->
        <Rock:Zone Name="Header" runat="server" />

        <!-- Ajax Error -->
        <div class="alert alert-danger ajax-error no-index" style="display:none">
            <p><strong>Error</strong></p>
            <span class="ajax-error-message"></span>
        </div>

        <asp:ContentPlaceHolder ID="feature" runat="server"></asp:ContentPlaceHolder>

        <asp:ContentPlaceHolder ID="main" runat="server"></asp:ContentPlaceHolder>

        <!-- Footer -->
        <Rock:Zone Name="Footer" runat="server" />

        <%-- controls for scriptmanager and update panel --%>
        <asp:ScriptManager ID="sManager" runat="server"/>
        <asp:UpdateProgress id="updateProgress" runat="server" DisplayAfter="800">
		        <ProgressTemplate>
		            <div class="updateprogress-status">
                        <div class="spinner">
                          <div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div>
                        </div>
                    </div>
                    <div class="updateprogress-bg modal-backdrop"></div>
		        </ProgressTemplate>
        </asp:UpdateProgress>

    </form>

    <script>
        Sys.Application.add_load(HandleBackForwardCache);

        // Fixes an issue with the wait spinner caused by browser Back/Forward caching.
        function HandleBackForwardCache() {
            // Forcibly hide the wait spinner, and clear the pending request if the page is being reloaded from bfcache. (Currently WebKit only)
            // Browsers that implement bfcache will otherwise trigger updateprogress because the pending request is still in the PageRequestManager state.
            // This fix is not effective for Safari browsers prior to v13, due to a known bug in the bfcache implementation.
            // (https://bugs.webkit.org/show_bug.cgi?id=156356)
            window.addEventListener('pageshow', function (e) {
                if ( e.persisted ) {
                    document.querySelector('#updateProgress').style.display = 'none';
                    // Check if the page is in postback, and if so, reset the PageRequestManager state.
                    if (Sys.WebForms.PageRequestManager.getInstance().get_isInAsyncPostBack()) {
                        // Reset the PageRequestManager state. & Manually clear the request object
                        Sys.WebForms.PageRequestManager.getInstance()._processingRequest = false;
                        Sys.WebForms.PageRequestManager.getInstance()._request = null;
                    }
                }
            });
        }

    </script>

</body>

</html>