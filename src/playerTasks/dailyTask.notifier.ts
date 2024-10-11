import { APIError } from "../common/controller/APIError";
import { NotificationGroup } from "../common/service/notificator/enum/NotificationGroup.enum";
import { NotificationResource } from "../common/service/notificator/enum/NotificationResource.enum";
import { NotificationStatus } from "../common/service/notificator/enum/NotificationStatus.enum";
import NotificationSender from "../common/service/notificator/NotificationSender";
import { TaskName } from "./enum/taskName.enum";
import { Task } from "./type/task.type";


export default class DailyTaskNotifier {
    private readonly group = NotificationGroup.PLAYER;
    private readonly resource = NotificationResource.DAILY_TASK;

    taskReceived(player_id: string, task: Task){
        NotificationSender
            .buildNotification<Task>()
            .addGroup(this.group, player_id)
            .addResource(this.resource, task.type)
            .send(NotificationStatus.NEW, task);
    }

    taskUpdated(player_id: string, task: Task){
        NotificationSender
            .buildNotification<Task>()
            .addGroup(this.group, player_id)
            .addResource(this.resource, task.type)
            .send(NotificationStatus.UPDATE, task);
    }

    taskError(player_id: string, taskType: TaskName, error: APIError){
        NotificationSender
            .buildNotification<APIError>()
            .addGroup(this.group, player_id)
            .addResource(this.resource, taskType)
            .send(NotificationStatus.ERROR, error);
    }

    taskCompleted(player_id: string, task: Task){
        NotificationSender
            .buildNotification<Task>()
            .addGroup(this.group, player_id)
            .addResource(this.resource, task.type)
            .send(NotificationStatus.END, task);
    }
}