#!/bin/bash

set -e

########################################################################
#"Elasticsearch requires the ability to create many memory-mapped areas.
#The maximum map count check checks that the kernel allows a process to have at 
#least 262,144 memory-mapped areas and is enforced on Linux only.
#To pass the maximum map count check, you must configure vm.max_map_count via sysctl to be at least 262144."
#src:https://www.elastic.co/guide/en/elasticsearch/reference/current/_maximum_map_count_check.html
########################################################################

required_vm_max_map_count=262144
new_vm_max_map_count=$(($required_vm_max_map_count*2))
current_vm_max_map_count=$(sudo sysctl -n vm.max_map_count 2> /dev/null)

if [ ! $current_vm_max_map_count == $new_vm_max_map_count ]; then
	echo current_vm_max_map_count=$current_vm_max_map_count
	echo new_vm_max_map_count=$new_vm_max_map_count
fi

if [ $current_vm_max_map_count == $new_vm_max_map_count ]; then
	echo vm.max_map_count is up to date!
else
	echo updating vm.max_map_count...
	sudo sysctl -w vm.max_map_count=$new_vm_max_map_count > /dev/null
	echo vm.max_map_count updated!
fi