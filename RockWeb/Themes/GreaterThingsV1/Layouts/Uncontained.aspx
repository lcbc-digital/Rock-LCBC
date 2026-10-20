<%@ Page Language="C#" MasterPageFile="Site.Master" AutoEventWireup="true" Inherits="Rock.Web.UI.RockPage" %>

<asp:Content ID="ctMain" ContentPlaceHolderID="main" runat="server">

	<main>

        <Rock:Zone Name="Feature" runat="server" />
        <Rock:Zone Name="Main" runat="server" />

	</main>

</asp:Content>