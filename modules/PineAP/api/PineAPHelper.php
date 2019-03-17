<?php namespace pineapple;

class PineAPHelper
{
    public function getSetting($settingKey)
    {
        $configFile = file_get_contents("/tmp/pineap.conf");

        $configFile = explode("\n", $configFile);
        foreach($configFile as $row => $data) {
            $entry = str_replace(" ", "", $data);
            $entry = explode("=", $entry);

            if ($entry[0] == $settingKey) {
                if ($entry[1] == 'on') {
                    return true;
                } elseif ($entry[1] == 'off') {
                    return false;
                } else {
                    return $entry[1];
                }
            }
        }

        return false;
    }

    public function enableAssociations()
    {
        exec("pineap /tmp/pineap.conf karma on");
        return true;
    }

    public function disableAssociations()
    {
        exec("pineap /tmp/pineap.conf karma off");
        return true;
    }

    public function enablePineAP()
    {
        exec('/etc/init.d/pineapd start');
        return true;
    }

    public function disablePineAP()
    {
        exec('/etc/init.d/pineapd stop');
        return true;
    }

    public function enableLogging()
    {
        exec("pineap /tmp/pineap.conf logging on");
        return true;
    }

    public function disableLogging()
    {
        exec("pineap /tmp/pineap.conf logging off");
        return true;
    }

    public function enableBeaconer()
    {
        exec('pineap /tmp/pineap.conf broadcast_pool on');
        return true;
    }

    public function disableBeaconer()
    {
        exec('pineap /tmp/pineap.conf broadcast_pool off');
        return true;
    }

    public function enableResponder()
    {
        exec('pineap /tmp/pineap.conf beacon_responses on');
        return true;
    }

    public function disableResponder()
    {
        exec('pineap /tmp/pineap.conf beacon_responses off');
        return true;
    }

    public function enableHarvester()
    {
        exec('pineap /tmp/pineap.conf capture_ssids on');
        return true;
    }

    public function disableHarvester()
    {
        exec('pineap /tmp/pineap.conf capture_ssids off');
        return true;
    }

    public function enableConnectNotifications()
    {
        exec('pineap /tmp/pineap.conf connect_notifications on');
        return true;
    }

    public function disableConnectNotifications()
    {
        exec('pineap /tmp/pineap.conf connect_notifications off');
        return true;
    }

    public function enableDisconnectNotifications()
    {
        exec('pineap /tmp/pineap.conf disconnect_notifications on');
        return true;
    }

    public function disableDisconnectNotifications()
    {
        exec('pineap /tmp/pineap.conf disconnect_notifications off');
        return true;
    }

    public function getTarget()
    {
        return $this->getSetting("target_mac");
    }

    public function getSource()
    {
        return $this->getSetting("pineap_mac");
    }

    public function setBeaconInterval($interval)
    {
        $interval = escapeshellarg($interval);
        exec("pineap /tmp/pineap.conf beacon_interval {$interval}");
        return;
    }

    public function setResponseInterval($interval)
    {
        $interval = escapeshellarg($interval);
        exec("pineap /tmp/pineap.conf beacon_response_interval {$interval}");
        return;
    }

    public function setSource($mac)
    {
        $mac = escapeshellarg($mac);
        exec("pineap /tmp/pineap.conf set_source {$mac}");
        return;
    }

    public function setTarget($mac)
    {
        $mac = escapeshellarg($mac);
        exec("pineap /tmp/pineap.conf set_target {$mac}");
        return;
    }

    public function deauth($target, $source, $channel, $multiplier = 1)
    {
        $channel = str_pad($channel, 2, "0", STR_PAD_LEFT);
        exec("pineap /tmp/pineap.conf deauth $source $target $channel $multiplier");
        return true;
    }
}
