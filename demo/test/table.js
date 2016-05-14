function ChangeColspanHiddenData() {
    var node;
    var ids = ["tc3", "tc0", "tc1", "tc4", "tc5", "tc2", "tc7", "tc6"];
    var spans = ["3", "10", "3", "3", "10", "5", "10", "7"];
    for (var i = 0; i < ids.length; i++) {
        node = document.getElementById(ids[i]);
        node.colSpan = spans[i];
    }
}