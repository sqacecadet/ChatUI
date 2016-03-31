package controllers;

import com.fasterxml.jackson.databind.JsonNode;
import play.libs.EventSource;
import play.mvc.Controller;
import play.mvc.Result;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Application extends Controller {

    /** Keeps track of all connected browsers per room **/
    private static Map<String, List<EventSource>> socketsPerRoom = new HashMap<String, List<EventSource>>();



     /**
     * Controller action serving AngularJS chat page
      */
    public static Result index() {
        return ok(views.html.index.render("Pixeon Chat App"));
    }

    /**
     * Establish the SSE HTTP 1.1 connection.
     * The new EventSource socket is stored in the socketsPerRoom Map
     * to keep track of which browser is in which room.
     *
     * onDisconnected removes the browser from the socketsPerRoom Map if the
     * browser window has been exited.
     * @return
     */
    public static void sendEvent(JsonNode msg) {
        /**   @Override */

        String room  = msg.findPath("room").textValue();

        if(socketsPerRoom.containsKey(room)) {
            socketsPerRoom.get(room).stream().forEach(
                    es -> es.send(EventSource.Event.event(msg))
            );
        }

        }

    /**
     * Controller action for POSTing chat messages
     */
    public static Result postMessage() {
        sendEvent(request().body().asJson());
        return ok();
    }


    public static Result UserList(String user) {
        sendEvent(request().body().asJson());
        return ok();
    }


    public static Result chatFeed(String room, String user) {
        String remoteAddress = request().remoteAddress();

        return ok(new EventSource() {
            @Override
            public void onConnected() {
                EventSource currentSocket = this;

                socketsPerRoom.get(user).stream().forEach(
                        es -> es.send(EventSource.Event.event(user))
                );

                this.onDisconnected(() -> {

                    socketsPerRoom.compute(room, (key, value) -> {
                        if(value.contains(currentSocket))
                            value.remove(currentSocket);
                        return value;
                    });
                });

                // Add socket to room
                socketsPerRoom.compute(room, (key, value) -> {
                    if(value == null) {
                        return new ArrayList<EventSource>() {{
                            add(currentSocket);
                        }};
                    }
                    else
                        value.add(currentSocket);
                    return value;
                });
            }
        });
    }



}