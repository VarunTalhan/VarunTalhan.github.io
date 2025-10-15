module com.example.netsentryliteapp {
    requires javafx.controls;
    requires javafx.fxml;
    requires java.net.http; // optional, keep it if your app sends HTTP requests

    opens com.example.netsentryliteapp to javafx.fxml;
    exports com.example.netsentryliteapp;
}
